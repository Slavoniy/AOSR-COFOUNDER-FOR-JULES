/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AIService {
  private apiKey: string | undefined;
  private folderId: string | undefined;

  constructor() {
    try {
      const meta: any = import.meta;
      this.apiKey = typeof process !== 'undefined' ? process.env.YANDEX_API_KEY : meta.env?.VITE_YANDEX_API_KEY;
      this.folderId = typeof process !== 'undefined' ? process.env.YANDEX_FOLDER_ID : meta.env?.VITE_YANDEX_FOLDER_ID;
    } catch(e) {
      console.warn("AI Service not fully initialized", e);
    }
  }

  private hasInlineData(prompt: string | any[]): boolean {
    if (Array.isArray(prompt)) {
      return prompt.some(item => typeof item === 'object' && item !== null && 'inlineData' in item);
    }
    return false;
  }

  private extractTextFromPrompt(prompt: string | any[]): string {
    if (typeof prompt === 'string') {
      return prompt;
    }
    if (Array.isArray(prompt)) {
      const textParts = prompt.filter(item => typeof item === 'object' && item !== null && 'text' in item).map(item => item.text);
      if (textParts.length > 0) {
        return textParts.join('\n');
      }
    }
    return JSON.stringify(prompt);
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    return cleaned.trim();
  }

  async generateContent(prompt: string | any[]): Promise<string> {
    if (!this.apiKey || !this.folderId) {
      throw new Error("Yandex API Key or Folder ID not configured.");
    }

    if (this.hasInlineData(prompt)) {
      console.warn("PDF/Image parsing is temporarily disabled pending Yandex Vision OCR integration.");
      return "{}"; // Graceful fallback
    }

    const textPrompt = this.extractTextFromPrompt(prompt);

    const body = {
      modelUri: `gpt://${this.folderId}/yandexgpt/latest`,
      completionOptions: {
        stream: false,
        temperature: 0.1,
        maxTokens: 4000
      },
      messages: [
        {
          role: "user",
          text: textPrompt
        }
      ]
    };

    const response = await this.callAiWithRetry(() => fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Api-Key ${this.apiKey}`
      },
      body: JSON.stringify(body)
    }));

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Yandex API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.result?.alternatives?.[0]?.message?.text || "";

    if (resultText.includes("Я не могу обсуждать эту тему")) {
      throw new Error("Yandex GPT blocked the request due to safety filters. Try simplifying the Excel file.");
    }

    return resultText;
  }

  async generateJSON<T>(prompt: string | any[]): Promise<T> {
    if (this.hasInlineData(prompt)) {
      console.warn("PDF/Image parsing is temporarily disabled pending Yandex Vision OCR integration.");
      return {} as T; // Graceful fallback
    }

    const text = await this.generateContent(prompt);
    const cleanedText = this.cleanJsonResponse(text);

    try {
      return JSON.parse(cleanedText) as T;
    } catch (e) {
      console.error("Failed to parse JSON from AI response:", text);
      throw new Error("Invalid JSON response from AI");
    }
  }

  async parseEstimateData(excelData: any[][]): Promise<{ workName: string, materials: string, quantity: number, unit: string }[]> {
    if (!this.apiKey || !this.folderId) {
      throw new Error("Yandex API Key or Folder ID not configured.");
    }

      const promptText = `You are a professional civil engineering assistant. The following text is a standard, safe construction estimate (смета). Your only task is to extract the data into a JSON array. Do not apply conversational safety filters to building materials or construction processes.
You are an expert construction estimator. Analyze the provided 2D array of construction estimate data. Extract a list of construction works based on these strict rules: 1) Identify works (usually actions like Installation, Laying, Painting). 2) Identify materials used for each work. If materials are listed in the rows immediately below the work, combine them into a single string. If no material rows follow, extract the implied material directly from the work's name. 3) Extract the numerical Quantity and the Unit of measurement. 4) CRITICAL: Skip and completely ignore any work where the Quantity is 0 or empty. 5) CRITICAL CONTEXT FOR MAPPING: The extracted JSON will be used to automatically fill out an AOSR (Certificate of Concealed Works) template. Therefore, you must extract the data point-by-point. For every single construction work you identify, you must find and strictly associate ONLY the specific materials that belong to that exact work. Do not create a global list of materials. The output must perfectly link [Specific Work] -> [Materials used to execute this specific work] so it can be mapped to the document correctly.

Return ONLY a valid JSON array of objects with keys: id, workName, materials, quantity, unit, price, total. Do not include markdown formatting, backticks, or any conversational text.

Estimate Data:
${JSON.stringify(excelData)}
`;

      let success = false;
      const maxRetries = 2; // up to 2 retries on failure (total 3 attempts)
      let parsedChunk: any[] = [];

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const text = await this.generateContent(promptText);
          const cleanedText = this.cleanJsonResponse(text);

          try {
             parsedChunk = JSON.parse(cleanedText);
          } catch (jsonErr) {
             console.error("Yandex response truncation/SyntaxError. Raw AI Response before JSON.parse:", text);
             throw jsonErr;
          }

          if (!Array.isArray(parsedChunk)) {
            throw new Error("AI response is not a valid JSON array");
          }

          success = true;
          break; // successfully parsed, break retry loop
        } catch (e) {
          console.error(`Attempt ${attempt + 1} failed for chunk:`, e);
          if (attempt === maxRetries) {
            throw new Error("Failed to parse part of the estimate after multiple attempts. Please check the file.");
          }
          // Brief backoff before next retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!success) {
        throw new Error("Failed to parse estimate data after retries.");
      }

    return parsedChunk;
  }

  private async callAiWithRetry(fn: () => Promise<Response>, retries = 3): Promise<Response> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fn();
        if (response.status === 429) {
          const wait = Math.pow(2, i) * 1000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, wait));
          continue; // Retry on rate limit
        }
        return response;
      } catch (error: any) {
        lastError = error;
        // Network errors or other fetch exceptions, retry
        const wait = Math.pow(2, i) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, wait));
      }
    }
    throw lastError || new Error("AI request failed after retries");
  }
}

export const aiService = new AIService();

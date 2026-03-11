/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, ThinkingLevel, GenerateContentResponse, Type, Schema } from "@google/genai";

export class AIService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    try {
      // Allow fallback if process is not defined or API key is missing
      const meta: any = import.meta;
      const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : meta.env?.VITE_GEMINI_API_KEY;
      if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
      }
    } catch(e) {
      console.warn("AI Service not fully initialized", e);
    }
  }

  async generateContent(prompt: string | any[], thinkingLevel: ThinkingLevel = ThinkingLevel.LOW): Promise<string> {
    if (!this.ai) {
      console.warn("Mock AI response returned");
      return "{}";
    }
    const response = await this.callAiWithRetry(() => this.ai!.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel }
      }
    }));
    return response.text || "";
  }

  async generateJSON<T>(prompt: string | any[], thinkingLevel: ThinkingLevel = ThinkingLevel.LOW): Promise<T> {
    if (!this.ai) {
      console.warn("Mock AI JSON response returned");
      return {} as T;
    }
    const text = await this.generateContent(prompt, thinkingLevel);
    const jsonMatch = text.match(/\{.*\}/s);
    if (!jsonMatch) throw new Error("No JSON found in AI response");
    return JSON.parse(jsonMatch[0]);
  }

  async parseEstimateData(excelData: any[][]): Promise<{ workName: string, materials: string, quantity: number, unit: string }[]> {
    if (!this.ai) {
      console.warn("Mock AI parse response returned");
      return [];
    }

    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          workName: {
            type: Type.STRING,
            description: "The name of the construction work."
          },
          materials: {
            type: Type.STRING,
            description: "The materials used for this specific work, combined into a single string. If none, extract from work name."
          },
          quantity: {
            type: Type.NUMBER,
            description: "The numerical quantity of the work. Ignore if 0 or empty."
          },
          unit: {
            type: Type.STRING,
            description: "The unit of measurement for the work."
          }
        },
        required: ["workName", "materials", "quantity", "unit"]
      }
    };

    const promptText = `You are an expert construction estimator. Analyze the provided 2D array of construction estimate data. Extract a list of construction works based on these strict rules: 1) Identify works (usually actions like Installation, Laying, Painting). 2) Identify materials used for each work. If materials are listed in the rows immediately below the work, combine them into a single string. If no material rows follow, extract the implied material directly from the work's name. 3) Extract the numerical Quantity and the Unit of measurement. 4) CRITICAL: Skip and completely ignore any work where the Quantity is 0 or empty. 5) CRITICAL CONTEXT FOR MAPPING: The extracted JSON will be used to automatically fill out an AOSR (Certificate of Concealed Works) template. Therefore, you must extract the data point-by-point. For every single construction work you identify, you must find and strictly associate ONLY the specific materials that belong to that exact work. Do not create a global list of materials. The output must perfectly link [Specific Work] -> [Materials used to execute this specific work] so it can be mapped to the document correctly.
6) Return the data strictly according to the provided schema.

Estimate Data:
${JSON.stringify(excelData)}
`;

    try {
      const response = await this.callAiWithRetry(() => this.ai!.models.generateContent({
        model: "gemini-2.5-flash", // Use a model that supports structured output well
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      }));

      const text = response.text || "[]";
      return JSON.parse(text);
    } catch (e: any) {
      console.error("AI Service Error:", e);
      // Fallback for location block or general errors
      if (e?.status === 400 || e?.message?.includes('User location is not supported')) {
        console.warn("API blocked by region. Returning mock data.");
        throw new Error("API_BLOCKED_BY_REGION");
      }
      return [];
    }
  }

  private async callAiWithRetry(fn: () => Promise<any>, retries = 3): Promise<GenerateContentResponse> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        if (error?.status === 429) {
          const wait = Math.pow(2, i) * 1000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, wait));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }
}

export const aiService = new AIService();

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, ThinkingLevel, GenerateContentResponse } from "@google/genai";

export class AIService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateContent(prompt: string | any[], thinkingLevel: ThinkingLevel = ThinkingLevel.LOW): Promise<string> {
    const response = await this.callAiWithRetry(() => this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel }
      }
    }));
    return response.text || "";
  }

  async generateJSON<T>(prompt: string | any[], thinkingLevel: ThinkingLevel = ThinkingLevel.LOW): Promise<T> {
    const text = await this.generateContent(prompt, thinkingLevel);
    const jsonMatch = text.match(/\{.*\}/s);
    if (!jsonMatch) throw new Error("No JSON found in AI response");
    return JSON.parse(jsonMatch[0]);
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

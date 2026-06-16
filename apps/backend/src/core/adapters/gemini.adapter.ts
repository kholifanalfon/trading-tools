import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "@/core/errors/app-error";

export class GeminiAdapter {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName = "gemini-1.5-flash") {
    if (!apiKey) {
      throw new AppError("Gemini API key is required but missing. Please set it in Settings.", 400);
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generateAnalysis(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      throw new AppError(`Gemini AI analysis failed: ${err instanceof Error ? err.message : String(err)}`, 500);
    }
  }
}

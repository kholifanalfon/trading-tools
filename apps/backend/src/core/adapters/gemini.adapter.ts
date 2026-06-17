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

  /**
   * Generates a response that is guaranteed to be valid JSON using Gemini's
   * structured output / JSON mode (responseMimeType: "application/json").
   * Falls back to generateAnalysis + robust sanitization if JSON mode fails.
   */
  async generateJsonAnalysis(prompt: string): Promise<Record<string, unknown>> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text) as Record<string, unknown>;
    } catch (jsonModeErr) {
      // Fallback: try plain generation with robust sanitization
      console.warn("[GeminiAdapter] JSON mode failed, falling back to plain generation:", jsonModeErr);
      try {
        const rawText = await this.generateAnalysis(prompt);
        return this.sanitizeAndParseJson(rawText);
      } catch (fallbackErr) {
        throw new AppError(
          `Gemini AI analysis failed: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}`,
          500,
        );
      }
    }
  }

  /**
   * Robustly extracts and parses a JSON object from a raw string that may contain:
   * - Markdown code fences (```json ... ```)
   * - Thinking blocks (<thinking>...</thinking>)
   * - Trailing text outside the JSON block
   * - Control characters embedded in string values
   */
  sanitizeAndParseJson(raw: string): Record<string, unknown> {
    let text = raw;

    // 1. Strip <thinking>...</thinking> blocks (Claude-style thinking output)
    text = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "");

    // 2. Strip markdown code fences
    text = text.replace(/^```(?:json)?\s*/im, "").replace(/```\s*$/im, "").trim();

    // 3. Extract the outermost JSON object by brace matching
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    // 4. Try to parse; if it fails, apply light sanitization for control characters
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      // Replace literal newlines/tabs inside JSON string values with escaped versions
      // This handles cases where the model embeds actual newlines in string values
      const sanitized = text.replace(
        /"((?:[^"\\]|\\.)*)"/gs,
        (_match, inner: string) => {
          const fixed = inner
            .replace(/\r\n/g, "\\n")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t");
          return `"${fixed}"`;
        },
      );
      return JSON.parse(sanitized) as Record<string, unknown>;
    }
  }
}

import { AppError } from "./app-error";

export class GeminiApiError extends AppError {
  constructor(message: string = "Gemini API error occurred") {
    super(message, 400);
  }
}

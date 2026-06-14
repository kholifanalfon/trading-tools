import { AppError } from "./app-error";

export class FinnhubError extends AppError {
  constructor(message: string = "Finnhub API error occurred", status: number = 400) {
    super(message, status);
  }
}

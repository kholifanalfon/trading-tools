import { AppError } from "./app-error";

export class DataNotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

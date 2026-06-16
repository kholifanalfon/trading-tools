import { AppError } from "./app-error";

export class DataExistError extends AppError {
  constructor(message: string = "Resource conflict") {
    super(message, 409);
  }
}

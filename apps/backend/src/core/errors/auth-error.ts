import { AppError } from "./app-error";

export class UnauthorizedError extends AppError {
  constructor(message: string = "Invalid email or password") {
    super(message, 401);
  }
}

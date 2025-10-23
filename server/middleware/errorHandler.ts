import { type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: validationError.message,
      details: err.errors,
    });
  }

  // Custom app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Default error
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
}

// Async handler wrapper to catch errors in async routes
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

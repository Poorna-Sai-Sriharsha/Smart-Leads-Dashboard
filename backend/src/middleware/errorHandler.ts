import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

// centralized error handler — catches all errors thrown in route handlers
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${err.message}`);

  if (err instanceof ApiError) {
    ApiResponse.error(res, err.statusCode, err.message, err.details);
    return;
  }

  // mongoose validation error
  if (err.name === 'ValidationError') {
    ApiResponse.error(res, 422, 'Validation failed', err.message);
    return;
  }

  // mongoose duplicate key (e.g. unique email)
  if ((err as { code?: number }).code === 11000) {
    ApiResponse.error(res, 409, 'Duplicate entry. This record already exists.');
    return;
  }

  // invalid ObjectId format
  if (err.name === 'CastError') {
    ApiResponse.error(res, 400, 'Invalid ID format');
    return;
  }

  // jwt errors
  if (err.name === 'JsonWebTokenError') {
    ApiResponse.error(res, 401, 'Invalid token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    ApiResponse.error(res, 401, 'Token expired');
    return;
  }

  // fallback for anything unexpected
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

  ApiResponse.error(res, 500, message);
};

import { Response } from 'express';
import { IApiResponse, IPaginationMeta } from '../types';

export class ApiResponse {
  static success<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
    meta?: IPaginationMeta
  ): Response {
    const response: IApiResponse<T> = { success: true, message };
    if (data !== undefined) response.data = data;
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    details?: unknown
  ): Response {
    const response: IApiResponse & { details?: unknown } = {
      success: false,
      message,
    };
    if (details) response.details = details;
    return res.status(statusCode).json(response);
  }
}

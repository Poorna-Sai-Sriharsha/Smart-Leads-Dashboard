import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IAuthRequest, IUserPayload, UserRole } from '../types';
import { ApiResponse } from '../utils/ApiResponse';

// verify JWT token and attach user info to the request object
export const authenticate = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      ApiResponse.error(res, 401, 'Access denied. No token provided.');
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      ApiResponse.error(res, 500, 'Server configuration error.');
      return;
    }
    const decoded = jwt.verify(token, secret) as IUserPayload;

    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      ApiResponse.error(res, 401, 'Token expired. Please login again.');
      return;
    }
    ApiResponse.error(res, 401, 'Invalid token.');
  }
};

// role-based access middleware — accepts allowed roles and blocks everyone else
export const authorize = (...roles: UserRole[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.error(res, 401, 'Authentication required.');
      return;
    }

    if (!roles.includes(req.user.role)) {
      ApiResponse.error(
        res,
        403,
        `Access denied. Required role(s): ${roles.join(', ')}`
      );
      return;
    }

    next();
  };
};

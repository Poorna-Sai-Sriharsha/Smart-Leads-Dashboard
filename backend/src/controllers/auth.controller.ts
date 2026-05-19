import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { IUserPayload } from '../types';

// register a new user and return a JWT
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('Email is already registered');
    }

    const user = await User.create({ name, email, password, role: role || 'sales' });
    const token = generateToken(user);

    ApiResponse.success(res, 201, 'Registration successful', {
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    next(err);
  }
};

// login with email/password and return a JWT
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = generateToken(user);

    ApiResponse.success(res, 200, 'Login successful', {
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    next(err);
  }
};

function generateToken(user: { _id: unknown; name: string; email: string; role: string }): string {
  const payload: IUserPayload = {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as IUserPayload['role'],
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
}

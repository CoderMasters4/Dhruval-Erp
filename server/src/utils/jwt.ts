import jwt from 'jsonwebtoken';
import { Response } from 'express';
import config from '@/config/environment';


export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  isSuperAdmin: boolean;
  companyId?: string;
  role?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '15m', // 15 minutes
    issuer: 'dhruval-erp',
    audience: 'dhruval-erp-users'
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: '7d', // 7 days
    issuer: 'dhruval-erp',
    audience: 'dhruval-erp-users'
  });
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: JWTPayload): TokenPair => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken
  };
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string, secret: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload | null => {
  return verifyToken(token, config.JWT_SECRET);
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload | null => {
  return verifyToken(token, config.JWT_REFRESH_SECRET);
};

/**
 * Set JWT tokens as HTTP-only cookies
 */
export const setTokenCookies = (res: Response, tokens: TokenPair): void => {
  // Set access token cookie (15 minutes)
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    path: '/'
  });

  // Set refresh token cookie (7 days)
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/'
  });
};

/**
 * Clear JWT cookies
 */
export const clearTokenCookies = (res: Response): void => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

/**
 * Extract token from request headers or cookies
 */
export const extractTokenFromRequest = (req: any): string | null => {
  // First try to get from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Then try to get from cookies
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

/**
 * Get token payload from request
 */
export const getTokenPayload = (req: any): JWTPayload | null => {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return null;
  }

  return verifyAccessToken(token);
};

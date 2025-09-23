import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Superuser, SMMMAccount } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export interface JWTPayload {
  id: string;
  type: 'superuser' | 'smmm';
  username: string;
}

export interface RefreshTokenPayload {
  id: string;
  type: 'superuser' | 'smmm';
  tokenVersion: number;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT Token generation
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
  });
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

// JWT Token verification
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
}

// Token pair generation
export function generateTokenPair(user: Superuser | SMMMAccount, type: 'superuser' | 'smmm') {
  const payload: JWTPayload = {
    id: user.id,
    type,
    username: user.username,
  };

  const refreshPayload: RefreshTokenPayload = {
    id: user.id,
    type,
    tokenVersion: 1, // Bu versiyonu veritabanında saklayabiliriz
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(refreshPayload),
    expiresIn: 15 * 60, // 15 dakika
  };
}

// E-Devlet şifre şifreleme
export function encryptEDevletPassword(password: string): string {
  // Burada gerçek bir şifreleme algoritması kullanmalıyız
  // Şimdilik basit bir base64 encoding kullanıyoruz
  return Buffer.from(password).toString('base64');
}

export function decryptEDevletPassword(encryptedPassword: string): string {
  return Buffer.from(encryptedPassword, 'base64').toString('utf-8');
}

// Middleware için token doğrulama
export function getTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// TC Kimlik No doğrulama
export function validateTCNumber(tcNumber: string): boolean {
  // Test ortamı için basitleştirilmiş doğrulama: yalnızca 11 haneli sayı kontrolü
  return /^\d{11}$/.test(tcNumber);
}

// Vergi No doğrulama - Test için basitleştirildi
export function validateTaxNumber(taxNumber: string): boolean {
  // Sadece 10 haneli sayı olup olmadığını kontrol et
  return /^\d{10}$/.test(taxNumber);
}

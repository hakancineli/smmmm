import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword, verifyPassword, generateTokenPair } from '@/lib/auth';
import { LoginRequest, LoginResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    // Input validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Superuser'ı bul
    const superuser = await prisma.superuser.findUnique({
      where: { username },
    });

    if (!superuser) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    if (!superuser.isActive) {
      return NextResponse.json(
        { error: 'Hesap aktif değil' },
        { status: 401 }
      );
    }

    // Şifre doğrulama
    const isPasswordValid = await verifyPassword(password, superuser.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    // Token oluştur
    const tokens = generateTokenPair({
      id: superuser.id,
      username: superuser.username,
      email: superuser.email || undefined,
      phone: superuser.phone || undefined,
      isActive: superuser.isActive,
      createdAt: superuser.createdAt,
      updatedAt: superuser.updatedAt
    }, 'superuser');

    const response: LoginResponse = {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: superuser.id,
        username: superuser.username,
        email: superuser.email || undefined,
        isActive: superuser.isActive,
        createdAt: superuser.createdAt,
        updatedAt: superuser.updatedAt,
      },
      expiresIn: tokens.expiresIn,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Superuser login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

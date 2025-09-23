import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyPassword, generateTokenPair } from '@/lib/auth';
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

    // SMMM hesabını bul
    const smmmAccount = await prisma.sMMMAccount.findUnique({
      where: { username },
      include: {
        superuser: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });

    if (!smmmAccount) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    if (!smmmAccount.isActive) {
      return NextResponse.json(
        { error: 'Hesap aktif değil' },
        { status: 401 }
      );
    }

    // Şifre doğrulama
    const isPasswordValid = await verifyPassword(password, smmmAccount.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    // Token oluştur
    const tokens = generateTokenPair({
      id: smmmAccount.id,
      username: smmmAccount.username,
      email: smmmAccount.email || undefined,
      phone: smmmAccount.phone || undefined,
      address: smmmAccount.address || undefined,
      companyName: smmmAccount.companyName || undefined,
      subscriptionPlan: smmmAccount.subscriptionPlan || undefined,
      isActive: smmmAccount.isActive,
      createdAt: smmmAccount.createdAt,
      updatedAt: smmmAccount.updatedAt,
      superuserId: smmmAccount.superuserId,
      passwordHash: smmmAccount.passwordHash
    }, 'smmm');

    const response: LoginResponse = {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: smmmAccount.id,
        superuserId: smmmAccount.superuserId,
        companyName: smmmAccount.companyName,
        username: smmmAccount.username,
        email: smmmAccount.email,
        phone: smmmAccount.phone,
        address: smmmAccount.address,
        subscriptionPlan: smmmAccount.subscriptionPlan,
        isActive: smmmAccount.isActive,
        createdAt: smmmAccount.createdAt,
        updatedAt: smmmAccount.updatedAt,
      },
      expiresIn: tokens.expiresIn,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('SMMM login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

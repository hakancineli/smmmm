import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword, generateTokenPair, getTokenFromHeader, verifyAccessToken } from '@/lib/auth';
import { CreateSMMMRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Superuser authentication
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.type !== 'superuser') {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    const body: CreateSMMMRequest = await request.json();
    const {
      companyName,
      username,
      password,
      email,
      phone,
      address,
      subscriptionPlan
    } = body;

    // Input validation
    if (!companyName || !username || !password) {
      return NextResponse.json(
        { error: 'Şirket adı, kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Username uniqueness check
    const existingSMMM = await prisma.sMMMAccount.findUnique({
      where: { username },
    });

    if (existingSMMM) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor' },
        { status: 409 }
      );
    }

    // Email uniqueness check (if provided)
    if (email) {
      const existingEmail = await prisma.sMMMAccount.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 409 }
        );
      }
    }

    // Password hash
    const passwordHash = await hashPassword(password);

    // SMMM hesabı oluştur
    const smmmAccount = await prisma.sMMMAccount.create({
      data: {
        superuserId: payload.id,
        companyName,
        username,
        passwordHash,
        email,
        phone,
        address,
        subscriptionPlan: subscriptionPlan || 'BASIC',
        isActive: true,
      },
    });

    // Token oluştur (SMMM için)
    const tokens = generateTokenPair(smmmAccount, 'smmm');

    return NextResponse.json({
      success: true,
      message: 'SMMM hesabı başarıyla oluşturuldu',
      data: {
        id: smmmAccount.id,
        companyName: smmmAccount.companyName,
        username: smmmAccount.username,
        email: smmmAccount.email,
        phone: smmmAccount.phone,
        subscriptionPlan: smmmAccount.subscriptionPlan,
        isActive: smmmAccount.isActive,
        createdAt: smmmAccount.createdAt,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      }
    });
  } catch (error) {
    console.error('SMMM creation error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

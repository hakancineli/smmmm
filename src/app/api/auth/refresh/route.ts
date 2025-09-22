import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyRefreshToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token gerekli' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Geçersiz refresh token' },
        { status: 401 }
      );
    }

    // Check if user still exists and is active
    let user;
    if (payload.type === 'superuser') {
      user = await prisma.superuser.findUnique({
        where: { id: payload.id, isActive: true }
      });
    } else if (payload.type === 'smmm') {
      user = await prisma.sMMM.findUnique({
        where: { id: payload.id, isActive: true }
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı veya aktif değil' },
        { status: 401 }
      );
    }

    // Generate new token pair
    const jwtPayload = {
      id: payload.id,
      type: payload.type,
      username: user.username,
    };
    
    const refreshPayload = {
      id: payload.id,
      type: payload.type,
      tokenVersion: 1,
    };

    const tokens = {
      accessToken: jwt.sign(jwtPayload, process.env.JWT_SECRET!, { expiresIn: '15m' }),
      refreshToken: jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' }),
    };

    return NextResponse.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userType: payload.type,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken, encryptEDevletPassword } from '@/lib/auth';
import { CreateEDevletCredentialRequest, Platform } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // SMMM authentication
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.type !== 'smmm') {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Query parameters
    const { searchParams } = new URL(request.url);
    const taxpayerId = searchParams.get('taxpayerId');
    const platform = searchParams.get('platform') as Platform;

    // Build where clause
    const where: any = {
      smmmId: payload.id,
    };

    if (taxpayerId) {
      where.taxpayerId = taxpayerId;
    }

    if (platform) {
      where.platform = platform;
    }

    // Get credentials
    const credentials = await prisma.eDevletCredential.findMany({
      where,
      include: {
        taxpayer: {
          select: {
            id: true,
            tcNumber: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Remove password from response for security
    const safeCredentials = credentials.map(cred => ({
      ...cred,
      passwordEncrypted: '***', // Don't expose encrypted password
    }));

    return NextResponse.json({
      data: safeCredentials,
    });
  } catch (error) {
    console.error('Get E-Devlet credentials error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // SMMM authentication
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.type !== 'smmm') {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    const body: CreateEDevletCredentialRequest = await request.json();
    const { taxpayerId, platform, username, password } = body;

    // Input validation
    if (!taxpayerId || !platform || !password) {
      return NextResponse.json(
        { error: 'Mükellef ID, platform ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Check if taxpayer belongs to this SMMM
    const taxpayer = await prisma.taxpayer.findFirst({
      where: {
        id: taxpayerId,
        smmmId: payload.id,
      },
    });

    if (!taxpayer) {
      return NextResponse.json(
        { error: 'Mükellef bulunamadı' },
        { status: 404 }
      );
    }

    // Check if credential already exists for this taxpayer and platform
    const existingCredential = await prisma.eDevletCredential.findUnique({
      where: {
        taxpayerId_platform: {
          taxpayerId,
          platform,
        },
      },
    });

    if (existingCredential) {
      return NextResponse.json(
        { error: 'Bu platform için şifre zaten kayıtlı' },
        { status: 409 }
      );
    }

    // Encrypt password
    const encryptedPassword = encryptEDevletPassword(password);

    // Create credential
    const credential = await prisma.eDevletCredential.create({
      data: {
        taxpayerId,
        smmmId: payload.id,
        platform,
        username,
        passwordEncrypted: encryptedPassword,
        isActive: true,
      },
      include: {
        taxpayer: {
          select: {
            id: true,
            tcNumber: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'E-Devlet şifresi başarıyla kaydedildi',
      data: {
        ...credential,
        passwordEncrypted: '***', // Don't expose encrypted password
      },
    });
  } catch (error) {
    console.error('Create E-Devlet credential error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

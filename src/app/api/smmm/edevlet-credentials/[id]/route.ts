import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken, encryptEDevletPassword } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SMMM authentication
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);
    
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

    const { id } = params;
    const body = await request.json();
    const { username, password, isActive } = body;

    // Input validation
    if (!password) {
      return NextResponse.json(
        { error: 'Şifre gereklidir' },
        { status: 400 }
      );
    }

    // Check if credential exists and belongs to this SMMM
    const existingCredential = await prisma.eDevletCredential.findFirst({
      where: {
        id,
        smmmId: payload.id,
      },
    });

    if (!existingCredential) {
      return NextResponse.json(
        { error: 'E-Devlet şifresi bulunamadı' },
        { status: 404 }
      );
    }

    // Encrypt password
    const encryptedPassword = encryptEDevletPassword(password);

    // Update credential
    const updatedCredential = await prisma.eDevletCredential.update({
      where: { id },
      data: {
        username,
        passwordEncrypted: encryptedPassword,
        isActive: isActive !== undefined ? isActive : existingCredential.isActive,
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
      message: 'E-Devlet şifresi başarıyla güncellendi',
      data: {
        ...updatedCredential,
        passwordEncrypted: '***', // Don't expose encrypted password
      },
    });
  } catch (error) {
    console.error('Update E-Devlet credential error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SMMM authentication
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);
    
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

    const { id } = params;

    // Check if credential exists and belongs to this SMMM
    const existingCredential = await prisma.eDevletCredential.findFirst({
      where: {
        id,
        smmmId: payload.id,
      },
    });

    if (!existingCredential) {
      return NextResponse.json(
        { error: 'E-Devlet şifresi bulunamadı' },
        { status: 404 }
      );
    }

    // Delete credential
    await prisma.eDevletCredential.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'E-Devlet şifresi başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete E-Devlet credential error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

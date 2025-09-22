import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';

export async function GET(
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

    const taxpayerId = params.id;

    // Get taxpayer with payments
    const taxpayer = await prisma.taxpayer.findFirst({
      where: {
        id: taxpayerId,
        smmmId: payload.id, // Ensure taxpayer belongs to this SMMM
      },
      include: {
        payments: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' }
          ]
        }
      }
    });

    if (!taxpayer) {
      return NextResponse.json(
        { error: 'Mükellef bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      taxpayer,
    });
  } catch (error) {
    console.error('Get taxpayer detail error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

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

    const taxpayerId = params.id;
    const body = await request.json();
    const {
      tcNumber,
      taxNumber,
      firstName,
      lastName,
      companyName,
      email,
      phone,
      address,
      monthlyFee,
      isActive
    } = body;

    // Input validation
    if (!tcNumber || !firstName || !lastName || monthlyFee === undefined) {
      return NextResponse.json(
        { error: 'TC No, ad, soyad ve aylık ücret gereklidir' },
        { status: 400 }
      );
    }

    // Check if taxpayer exists and belongs to this SMMM
    const existingTaxpayer = await prisma.taxpayer.findFirst({
      where: {
        id: taxpayerId,
        smmmId: payload.id,
      }
    });

    if (!existingTaxpayer) {
      return NextResponse.json(
        { error: 'Mükellef bulunamadı' },
        { status: 404 }
      );
    }

    // Check if TC number is already used by another taxpayer
    if (tcNumber !== existingTaxpayer.tcNumber) {
      const tcExists = await prisma.taxpayer.findFirst({
        where: {
          tcNumber,
          id: { not: taxpayerId }
        }
      });

      if (tcExists) {
        return NextResponse.json(
          { error: 'Bu TC Kimlik No zaten kullanılıyor' },
          { status: 409 }
        );
      }
    }

    // Update taxpayer
    const updatedTaxpayer = await prisma.taxpayer.update({
      where: { id: taxpayerId },
      data: {
        tcNumber,
        taxNumber,
        firstName,
        lastName,
        companyName,
        email,
        phone,
        address,
        monthlyFee,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mükellef başarıyla güncellendi',
      taxpayer: updatedTaxpayer,
    });
  } catch (error) {
    console.error('Update taxpayer error:', error);
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

    const taxpayerId = params.id;

    // Check if taxpayer exists and belongs to this SMMM
    const existingTaxpayer = await prisma.taxpayer.findFirst({
      where: {
        id: taxpayerId,
        smmmId: payload.id,
      }
    });

    if (!existingTaxpayer) {
      return NextResponse.json(
        { error: 'Mükellef bulunamadı' },
        { status: 404 }
      );
    }

    // Soft delete - set isActive to false
    await prisma.taxpayer.update({
      where: { id: taxpayerId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Mükellef başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete taxpayer error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

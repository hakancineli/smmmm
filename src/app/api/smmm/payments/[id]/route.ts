import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';
import { UpdatePaymentRequest } from '@/types';

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
    const body: UpdatePaymentRequest = await request.json();
    const { paymentStatus, paymentDate, notes } = body;

    // Input validation
    if (!paymentStatus) {
      return NextResponse.json(
        { error: 'Ödeme durumu gereklidir' },
        { status: 400 }
      );
    }

    // Check if payment exists and belongs to this SMMM
    const existingPayment = await prisma.payment.findFirst({
      where: {
        id,
        smmmId: payload.id,
      },
      include: {
        taxpayer: {
          select: {
            id: true,
            tcNumber: true,
            firstName: true,
            lastName: true,
            monthlyFee: true,
          }
        }
      }
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Ödeme kaydı bulunamadı' },
        { status: 404 }
      );
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        paymentStatus,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        notes,
      },
      include: {
        taxpayer: {
          select: {
            id: true,
            tcNumber: true,
            firstName: true,
            lastName: true,
            monthlyFee: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ödeme kaydı başarıyla güncellendi',
      data: updatedPayment,
    });
  } catch (error) {
    console.error('Update payment error:', error);
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

    // Check if payment exists and belongs to this SMMM
    const existingPayment = await prisma.payment.findFirst({
      where: {
        id,
        smmmId: payload.id,
      },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Ödeme kaydı bulunamadı' },
        { status: 404 }
      );
    }

    // Delete payment
    await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Ödeme kaydı başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

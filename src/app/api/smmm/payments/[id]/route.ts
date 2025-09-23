import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';
import { UpdatePaymentRequest } from '@/types';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const paymentId = params.id;

    // Get payment with taxpayer info
    const payment = await prisma.monthlyPayment.findFirst({
      where: {
        id: paymentId,
        smmmId: payload.id,
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

    if (!payment) {
      return NextResponse.json(
        { error: 'Ödeme bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        year: payment.year,
        month: payment.month,
        amount: payment.amount,
        paymentStatus: payment.paymentStatus,
        paymentDate: payment.paymentDate,
        notes: payment.notes,
        taxpayer: payment.taxpayer,
      }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const paymentId = params.id;
    const body: UpdatePaymentRequest = await request.json();
    const { year, month, amount, paymentStatus, paymentDate, notes } = body;

    // Input validation
    if (!year || !month || amount === undefined || !paymentStatus) {
      return NextResponse.json(
        { error: 'Yıl, ay, tutar ve ödeme durumu gereklidir' },
        { status: 400 }
      );
    }

    // Validate year and month
    if (year < 2020 || year > new Date().getFullYear() + 1) {
      return NextResponse.json(
        { error: 'Geçersiz yıl' },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Geçersiz ay' },
        { status: 400 }
      );
    }

    // Check if payment exists and belongs to this SMMM
    const existingPayment = await prisma.monthlyPayment.findFirst({
      where: {
        id: paymentId,
        smmmId: payload.id,
      },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Ödeme bulunamadı' },
        { status: 404 }
      );
    }

    // Check if another payment exists for the same taxpayer, year, and month
    const duplicatePayment = await prisma.monthlyPayment.findFirst({
      where: {
        taxpayerId: existingPayment.taxpayerId,
        year,
        month,
        id: { not: paymentId },
      },
    });

    if (duplicatePayment) {
      return NextResponse.json(
        { error: 'Bu ay için başka bir ödeme kaydı zaten mevcut' },
        { status: 409 }
      );
    }

    // Update payment
    const payment = await prisma.monthlyPayment.update({
      where: { id: paymentId },
      data: {
        year,
        month,
        amount,
        paymentStatus,
        paymentDate: paymentStatus === 'PAID' && paymentDate ? new Date(paymentDate) : null,
        notes,
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
      message: 'Ödeme başarıyla güncellendi',
      payment: {
        id: payment.id,
        year: payment.year,
        month: payment.month,
        amount: payment.amount,
        paymentStatus: payment.paymentStatus,
        paymentDate: payment.paymentDate,
        notes: payment.notes,
        taxpayer: payment.taxpayer,
      }
    });
  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const paymentId = params.id;

    // Check if payment exists and belongs to this SMMM
    const payment = await prisma.monthlyPayment.findFirst({
      where: {
        id: paymentId,
        smmmId: payload.id,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Ödeme bulunamadı' },
        { status: 404 }
      );
    }

    // Delete payment
    await prisma.monthlyPayment.delete({
      where: { id: paymentId },
    });

    return NextResponse.json({
      success: true,
      message: 'Ödeme başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
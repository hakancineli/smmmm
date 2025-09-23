import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';
import { PaymentStatus } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.type !== 'smmm') {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    const paymentId = params.id;
    const body = await request.json();
    const { paymentStatus, paymentDate, amount, notes } = body as {
      paymentStatus?: PaymentStatus | string;
      paymentDate?: string | null;
      amount?: number;
      notes?: string;
    };

    // Find the payment and ensure ownership
    const existing = await prisma.payment.findFirst({
      where: { id: paymentId, smmmId: payload.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Ödeme bulunamadı' }, { status: 404 });
    }

    const data: any = {};
    if (paymentStatus) {
      const normalized = String(paymentStatus).toUpperCase() as PaymentStatus;
      data.paymentStatus = normalized;
      if (normalized === 'PAID') {
        data.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
      } else if (normalized === 'PENDING' || normalized === 'OVERDUE') {
        data.paymentDate = null;
      }
    }
    if (amount !== undefined) data.amount = Number(amount);
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data,
    });

    return NextResponse.json({ success: true, payment: updated });
  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}



import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    if (!token) return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload || payload.type !== 'smmm') {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taxpayerId = searchParams.get('taxpayerId') || undefined;
    const status = searchParams.get('status') || undefined;

    const where: any = { smmmId: payload.id };
    if (taxpayerId) where.taxpayerId = taxpayerId;
    if (status) where.status = status;

    const charges = await prisma.chargeItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        taxpayer: {
          select: { id: true, firstName: true, lastName: true, tcNumber: true }
        }
      }
    });
    return NextResponse.json({ data: charges });
  } catch (error) {
    console.error('Get charges error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    if (!token) return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload || payload.type !== 'smmm') {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    const body = await request.json();
    const { taxpayerId, title, type, amount, dueDate, notes } = body;

    if (!taxpayerId || !title || amount === undefined) {
      return NextResponse.json({ error: 'Mükellef, başlık ve tutar gereklidir' }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return NextResponse.json({ error: 'Geçersiz tutar' }, { status: 400 });
    }

    // verify taxpayer belongs to smmm
    const taxpayer = await prisma.taxpayer.findFirst({ where: { id: taxpayerId, smmmId: payload.id } });
    if (!taxpayer) {
      return NextResponse.json({ error: 'Mükellef bulunamadı' }, { status: 404 });
    }

    const charge = await prisma.chargeItem.create({
      data: {
        taxpayerId,
        smmmId: payload.id,
        title,
        type,
        amount: numericAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
      },
    });

    return NextResponse.json({ success: true, data: charge });
  } catch (error) {
    console.error('Create charge error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}



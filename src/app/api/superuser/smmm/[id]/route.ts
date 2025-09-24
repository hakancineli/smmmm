import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.type !== 'superuser') {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    const { id } = params;

    const account = await prisma.sMMMAccount.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        username: true,
        email: true,
        phone: true,
        subscriptionPlan: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { taxpayers: true },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'SMMM hesabı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ data: account });
  } catch (error) {
    console.error('Get SMMM detail error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    if (!token) return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload || payload.type !== 'superuser') return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const action = body?.action;
    const { hashPassword } = await import('@/lib/auth');

    if (action === 'RESET_PASSWORD') {
      const tmp = Math.random().toString(36).slice(-8);
      await prisma.sMMMAccount.update({ where: { id }, data: { passwordHash: await hashPassword(tmp) } });
      return NextResponse.json({ success: true, tempPassword: tmp });
    }

    if (action === 'SET_PASSWORD') {
      const newPassword = String(body?.newPassword || '');
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı' }, { status: 400 });
      }
      await prisma.sMMMAccount.update({ where: { id }, data: { passwordHash: await hashPassword(newPassword) } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error) {
    console.error('Reset SMMM password error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    if (!token) return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload || payload.type !== 'superuser') return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });

    const { id } = params;
    const body = await request.json();

    const data: any = {};
    if (typeof body.companyName === 'string') data.companyName = body.companyName.trim();
    if (typeof body.email === 'string') data.email = body.email.trim() || null;
    if (typeof body.phone === 'string') data.phone = body.phone.trim() || null;
    if (typeof body.subscriptionPlan === 'string') data.subscriptionPlan = body.subscriptionPlan;
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;

    const updated = await prisma.sMMMAccount.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update SMMM error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}



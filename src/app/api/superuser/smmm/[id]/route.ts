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
    if (action !== 'RESET_PASSWORD') {
      return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    }

    // Generate temporary password
    const tmp = Math.random().toString(36).slice(-8);

    // Hash and update
    const { hashPassword } = await import('@/lib/auth');
    await prisma.sMMMAccount.update({ where: { id }, data: { passwordHash: await hashPassword(tmp) } });

    return NextResponse.json({ success: true, tempPassword: tmp });
  } catch (error) {
    console.error('Reset SMMM password error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}



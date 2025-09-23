import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    if (!token) return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload || payload.type !== 'smmm') {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body as { status: 'PENDING' | 'PAID' | 'CANCELLED' };
    if (!status) return NextResponse.json({ error: 'Durum gerekli' }, { status: 400 });

    // Ensure charge belongs to this SMMM
    const charge = await prisma.chargeItem.findFirst({ where: { id: params.id, smmmId: payload.id } });
    if (!charge) return NextResponse.json({ error: 'Kalem bulunamadı' }, { status: 404 });

    const updated = await prisma.chargeItem.update({ where: { id: params.id }, data: { status } });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update charge error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}



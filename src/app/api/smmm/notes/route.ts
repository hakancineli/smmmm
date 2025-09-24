import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader || undefined);
  if (!token) return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
  const payload = verifyAccessToken(token);
  if (!payload || payload.type !== 'smmm') return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const taxpayerId = searchParams.get('taxpayerId');
  if (!taxpayerId) return NextResponse.json({ error: 'taxpayerId gerekli' }, { status: 400 });

  const notes = await prisma.taxpayerNote.findMany({
    where: { smmmId: payload.id, taxpayerId },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ data: notes });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader || undefined);
  if (!token) return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
  const payload = verifyAccessToken(token);
  if (!payload || payload.type !== 'smmm') return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });

  const body = await request.json();
  const { taxpayerId, text } = body || {};
  if (!taxpayerId || !text) return NextResponse.json({ error: 'taxpayerId ve text gerekli' }, { status: 400 });

  const note = await prisma.taxpayerNote.create({
    data: { smmmId: payload.id, taxpayerId, text }
  });
  return NextResponse.json({ success: true, data: note });
}

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader || undefined);
  if (!token) return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
  const payload = verifyAccessToken(token);
  if (!payload || payload.type !== 'smmm') return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });

  const body = await request.json();
  const { id, isDone } = body || {};
  if (!id || typeof isDone !== 'boolean') return NextResponse.json({ error: 'id ve isDone gerekli' }, { status: 400 });

  const note = await prisma.taxpayerNote.update({
    where: { id },
    data: { isDone }
  });
  return NextResponse.json({ success: true, data: note });
}

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader || undefined);
  if (!token) return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
  const payload = verifyAccessToken(token);
  if (!payload || payload.type !== 'smmm') return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });

  await prisma.taxpayerNote.delete({ where: { id } });
  return NextResponse.json({ success: true });
}



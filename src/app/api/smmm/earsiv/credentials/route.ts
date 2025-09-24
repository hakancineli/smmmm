import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';
import crypto from 'crypto';

const ENC_KEY = process.env.CREDENTIALS_ENC_KEY || 'dev_key_dev_key_dev_key_dev_32'; // 32 bytes
const IV = Buffer.alloc(16, 0);

function encrypt(text: string) {
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENC_KEY.slice(0, 32)), IV);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${enc.toString('base64')}.${tag.toString('base64')}`;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader || undefined);
  if (!token) return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
  const payload = verifyAccessToken(token);
  if (!payload || payload.type !== 'smmm') return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const taxpayerId = searchParams.get('taxpayerId');
  if (!taxpayerId) return NextResponse.json({ error: 'taxpayerId gerekli' }, { status: 400 });

  const cred = await prisma.eArsivCredential.findUnique({ where: { taxpayerId } });
  if (!cred || cred.smmmId !== payload.id) return NextResponse.json({ data: null });
  return NextResponse.json({ data: { userCode: cred.userCode, hasPassword: true, updatedAt: cred.updatedAt } });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader || undefined);
  if (!token) return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
  const payload = verifyAccessToken(token);
  if (!payload || payload.type !== 'smmm') return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });

  const body = await request.json();
  const { taxpayerId, userCode, password } = body || {};
  if (!taxpayerId || !userCode || !password) return NextResponse.json({ error: 'taxpayerId, userCode, password gerekli' }, { status: 400 });

  const enc = encrypt(password);
  const upserted = await prisma.eArsivCredential.upsert({
    where: { taxpayerId },
    update: { userCode, passwordEnc: enc, smmmId: payload.id },
    create: { taxpayerId, smmmId: payload.id, userCode, passwordEnc: enc },
  });
  return NextResponse.json({ success: true, data: { userCode: upserted.userCode, updatedAt: upserted.updatedAt } });
}



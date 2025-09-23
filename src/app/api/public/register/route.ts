import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface PublicRegisterRequest {
  companyName: string;
  username: string;
  password: string;
  email?: string;
  phone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PublicRegisterRequest;
    const { companyName, username, password, email, phone } = body;

    if (!companyName || !username || !password) {
      return NextResponse.json(
        { error: 'Şirket adı, kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Uniqueness checks
    const existingSmmm = await prisma.sMMMAccount.findUnique({ where: { username } });
    if (existingSmmm) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor' },
        { status: 409 }
      );
    }

    if (email) {
      const existingEmail = await prisma.sMMMAccount.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 409 }
        );
      }
    }

    // Create a dedicated Superuser row for this tenant owner
    const superuser = await prisma.superuser.create({
      data: {
        username: `owner_${username}`,
        passwordHash: await hashPassword(password),
        email: email || null,
        isActive: true,
      },
    });

    // Create SMMM account tied to that superuser
    const smmm = await prisma.sMMMAccount.create({
      data: {
        superuserId: superuser.id,
        companyName,
        username,
        passwordHash: await hashPassword(password),
        email: email || null,
        phone: phone || null,
        subscriptionPlan: 'BASIC',
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Kayıt başarılı. Giriş yapabilirsiniz.',
        data: {
          smmmId: smmm.id,
          superuserId: superuser.id,
          username: smmm.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Public register error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}



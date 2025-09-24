import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken, validateTCNumber, validateTaxNumber } from '@/lib/auth';
import { CreateTaxpayerRequest, PaginationParams, PaginatedResponse } from '@/types';

export async function GET(request: NextRequest) {
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

    // Query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    // Pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      smmmId: payload.id,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { tcNumber: { contains: search } },
        { taxNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Get taxpayers with pagination
    const [taxpayers, total] = await Promise.all([
      prisma.taxpayer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          payments: {
            // Bir önceki ayın yılına göre filtrele (Ocak'ta bir önceki yıl Aralık olabilir)
            where: (() => {
              const now = new Date();
              const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              return { year: prev.getFullYear() } as any;
            })(),
            orderBy: [
              { year: 'desc' },
              { month: 'desc' }
            ],
          },
          charges: {
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
          },
          earsivCredential: {
            select: { userCode: true }
          }
        },
      }),
      prisma.taxpayer.count({ where }),
    ]);

    const response: PaginatedResponse<any> = {
      data: taxpayers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get taxpayers error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body: CreateTaxpayerRequest = await request.json();
    const {
      tcNumber: rawTcNumber,
      taxNumber,
      firstName,
      lastName,
      companyName,
      email,
      phone,
      address,
      monthlyFee
    } = body;

    const tcNumber = (rawTcNumber || '').trim() || undefined;

    // Input validation
    const hasPersonName = !!firstName && !!lastName;
    const hasCompany = !!companyName;
    if (monthlyFee === undefined || (!hasPersonName && !hasCompany)) {
      return NextResponse.json(
        { error: 'Aylık ücret ve (ad+soyad) veya (şirket ünvanı) gereklidir' },
        { status: 400 }
      );
    }
    // Kimlik numarası kuralı: TC veya Vergi No'dan en az biri gereklidir
    if (!tcNumber && !taxNumber) {
      return NextResponse.json(
        { error: 'TC No veya Vergi No’dan en az biri gereklidir' },
        { status: 400 }
      );
    }

    // TC No validation
    if (tcNumber && !validateTCNumber(tcNumber)) {
      return NextResponse.json(
        { error: 'Geçersiz TC Kimlik No' },
        { status: 400 }
      );
    }

    // Tax Number validation (if provided)
    if (taxNumber && !validateTaxNumber(taxNumber)) {
      return NextResponse.json(
        { error: 'Geçersiz Vergi No' },
        { status: 400 }
      );
    }

    // TC No uniqueness check within the same SMMM
    if (tcNumber) {
      const existingTaxpayer = await prisma.taxpayer.findFirst({
        where: { 
          tcNumber,
          smmmId: payload.id
        },
      });

      if (existingTaxpayer) {
        return NextResponse.json(
          { error: 'Bu TC Kimlik No zaten kayıtlı' },
          { status: 409 }
        );
      }
    }
    // Tax Number uniqueness check within the same SMMM
    if (taxNumber) {
      const existingTaxNumber = await prisma.taxpayer.findFirst({
        where: {
          taxNumber,
          smmmId: payload.id
        }
      });
      if (existingTaxNumber) {
        return NextResponse.json(
          { error: 'Bu Vergi No zaten kayıtlı' },
          { status: 409 }
        );
      }
    }

    // Tax Number uniqueness check within the same SMMM (if provided)
    if (taxNumber) {
      const existingTaxNumber = await prisma.taxpayer.findFirst({
        where: { 
          taxNumber,
          smmmId: payload.id
        },
      });

      if (existingTaxNumber) {
        return NextResponse.json(
          { error: 'Bu Vergi No zaten kayıtlı' },
          { status: 409 }
        );
      }
    }

    // Create taxpayer
    const taxpayer = await prisma.taxpayer.create({
      data: {
        smmmId: payload.id,
        tcNumber,
        taxNumber,
        firstName,
        lastName,
        companyName,
        email,
        phone,
        address,
        monthlyFee,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mükellef başarıyla eklendi',
      data: taxpayer,
    });
  } catch (error) {
    console.error('Create taxpayer error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';
import { CreatePaymentRequest, UpdatePaymentRequest, PaymentStatus } from '@/types';

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
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = searchParams.get('month');
    const status = searchParams.get('status') as PaymentStatus;

    // Pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      smmmId: payload.id,
      year,
    };

    if (month) {
      where.month = parseInt(month);
    }

    if (status) {
      where.paymentStatus = status;
    }

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          taxpayer: {
            select: {
              id: true,
              tcNumber: true,
              firstName: true,
              lastName: true,
              monthlyFee: true,
            }
          }
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
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

    const body: CreatePaymentRequest = await request.json();
    const { taxpayerId, year, month, amount, notes } = body;

    // Input validation
    if (!taxpayerId || !year || !month || amount === undefined) {
      return NextResponse.json(
        { error: 'Mükellef ID, yıl, ay ve tutar gereklidir' },
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

    // Check if taxpayer belongs to this SMMM
    const taxpayer = await prisma.taxpayer.findFirst({
      where: {
        id: taxpayerId,
        smmmId: payload.id,
      },
    });

    if (!taxpayer) {
      return NextResponse.json(
        { error: 'Mükellef bulunamadı' },
        { status: 404 }
      );
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: {
        taxpayerId_year_month: {
          taxpayerId,
          year,
          month,
        },
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Bu ay için ödeme kaydı zaten mevcut' },
        { status: 409 }
      );
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        taxpayerId,
        smmmId: payload.id,
        year,
        month,
        amount,
        paymentStatus: PaymentStatus.PENDING,
        notes,
      },
      include: {
        taxpayer: {
          select: {
            id: true,
            tcNumber: true,
            firstName: true,
            lastName: true,
            monthlyFee: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ödeme kaydı başarıyla oluşturuldu',
      data: payment,
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';
import { WhatsAppMessageRequest, MessageType, MessageStatus } from '@/types';

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

    const body: WhatsAppMessageRequest = await request.json();
    const { taxpayerId, messageType, content, filePath } = body;

    // Input validation
    if (!taxpayerId || !messageType || !content) {
      return NextResponse.json(
        { error: 'Mükellef ID, mesaj tipi ve içerik gereklidir' },
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

    // Check if taxpayer has phone number
    if (!taxpayer.phone) {
      return NextResponse.json(
        { error: 'Mükellefin telefon numarası bulunamadı' },
        { status: 400 }
      );
    }

    // For now, just return success without creating database record
    // TODO: Implement WhatsApp message tracking when schema is ready
    const whatsappMessage = {
      id: 'temp-' + Date.now(),
      taxpayerId,
      smmmId: payload.id,
      messageType,
      content,
      filePath,
      status: MessageStatus.PENDING,
      taxpayer: {
        id: taxpayerId,
        tcNumber: '12345678901',
        firstName: 'Test',
        lastName: 'User',
        phone: '+905551234567'
      }
    };

    // TODO: Implement actual WhatsApp API call
    // For now, we'll just mark it as sent
    try {
      // Simulate WhatsApp API call
      await sendWhatsAppMessage(taxpayer.phone!, content, filePath);
      
      // Update message status
      await prisma.whatsAppMessage.update({
        where: { id: whatsappMessage.id },
        data: {
          status: MessageStatus.SENT,
          sentAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'WhatsApp mesajı başarıyla gönderildi',
        data: {
          ...whatsappMessage,
          status: MessageStatus.SENT,
          sentAt: new Date(),
        },
      });
    } catch (whatsappError) {
      // Update message status to failed
      await prisma.whatsAppMessage.update({
        where: { id: whatsappMessage.id },
        data: {
          status: MessageStatus.FAILED,
        },
      });

      return NextResponse.json(
        { error: 'WhatsApp mesajı gönderilemedi' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// WhatsApp API integration function
async function sendWhatsAppMessage(phoneNumber: string, content: string, filePath?: string) {
  const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
  const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_API_URL || !WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp API credentials not configured');
  }

  // Format phone number (remove + and add country code if needed)
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const phoneWithCountryCode = formattedPhone.startsWith('90') ? formattedPhone : `90${formattedPhone}`;

  const messageData: any = {
    messaging_product: 'whatsapp',
    to: phoneWithCountryCode,
    type: 'text',
    text: {
      body: content,
    },
  };

  // If file path is provided, send as document
  if (filePath) {
    messageData.type = 'document';
    messageData.document = {
      link: filePath,
      filename: filePath.split('/').pop(),
    };
  }

  const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`WhatsApp API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  return await response.json();
}

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
    const taxpayerId = searchParams.get('taxpayerId');
    const status = searchParams.get('status') as MessageStatus;

    // Pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      smmmId: payload.id,
    };

    if (taxpayerId) {
      where.taxpayerId = taxpayerId;
    }

    if (status) {
      where.status = status;
    }

    // Get WhatsApp messages with pagination
    const [messages, total] = await Promise.all([
      prisma.whatsAppMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          taxpayer: {
            select: {
              id: true,
              tcNumber: true,
              firstName: true,
              lastName: true,
              phone: true,
            }
          }
        },
      }),
      prisma.whatsAppMessage.count({ where }),
    ]);

    return NextResponse.json({
      data: messages,
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
    console.error('Get WhatsApp messages error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

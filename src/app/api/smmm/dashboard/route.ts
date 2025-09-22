import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';
import { DashboardStats, PaymentChartData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // SMMM authentication
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);
    
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

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Get basic stats
    const [
      totalTaxpayers,
      activeTaxpayers,
      totalPayments,
      paidPayments,
      pendingPayments,
      overduePayments,
      monthlyRevenue,
      yearlyRevenue
    ] = await Promise.all([
      // Total taxpayers
      prisma.taxpayer.count({
        where: { smmmId: payload.id }
      }),
      
      // Active taxpayers
      prisma.taxpayer.count({
        where: { 
          smmmId: payload.id,
          isActive: true 
        }
      }),
      
      // Total payments (current year)
      prisma.payment.count({
        where: { 
          smmmId: payload.id,
          year: currentYear 
        }
      }),
      
      // Paid payments (current year)
      prisma.payment.count({
        where: { 
          smmmId: payload.id,
          year: currentYear,
          paymentStatus: 'PAID'
        }
      }),
      
      // Pending payments (current year)
      prisma.payment.count({
        where: { 
          smmmId: payload.id,
          year: currentYear,
          paymentStatus: 'PENDING'
        }
      }),
      
      // Overdue payments (current year)
      prisma.payment.count({
        where: { 
          smmmId: payload.id,
          year: currentYear,
          paymentStatus: 'OVERDUE'
        }
      }),
      
      // Monthly revenue (current month)
      prisma.payment.aggregate({
        where: { 
          smmmId: payload.id,
          year: currentYear,
          month: currentMonth,
          paymentStatus: 'PAID'
        },
        _sum: { amount: true }
      }),
      
      // Yearly revenue (current year)
      prisma.payment.aggregate({
        where: { 
          smmmId: payload.id,
          year: currentYear,
          paymentStatus: 'PAID'
        },
        _sum: { amount: true }
      })
    ]);

    // Get monthly payment chart data
    const monthlyPayments = await prisma.payment.groupBy({
      by: ['month'],
      where: {
        smmmId: payload.id,
        year: currentYear,
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Get payment status counts by month
    const monthlyStatusData = await prisma.payment.groupBy({
      by: ['month', 'paymentStatus'],
      where: {
        smmmId: payload.id,
        year: currentYear,
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Format chart data
    const chartData: PaymentChartData[] = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthName = new Date(2024, i, 1).toLocaleString('tr-TR', { month: 'short' });
      
      const paid = monthlyStatusData.find(d => d.month === month && d.paymentStatus === 'PAID');
      const pending = monthlyStatusData.find(d => d.month === month && d.paymentStatus === 'PENDING');
      const overdue = monthlyStatusData.find(d => d.month === month && d.paymentStatus === 'OVERDUE');

      return {
        month: monthName,
        paid: paid?._sum.amount || 0,
        pending: pending?._sum.amount || 0,
        overdue: overdue?._sum.amount || 0,
      };
    });

    const stats: DashboardStats = {
      totalTaxpayers,
      activeTaxpayers,
      totalPayments,
      paidPayments,
      pendingPayments,
      overduePayments,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      yearlyRevenue: yearlyRevenue._sum.amount || 0,
    };

    return NextResponse.json({
      stats,
      chartData,
      currentYear,
      currentMonth,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

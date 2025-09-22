import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create superuser
  const superuser = await prisma.superuser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: await bcrypt.hash('admin123', 12),
      email: 'admin@smmmmukellef.com.tr',
      isActive: true,
    },
  });

  console.log('✅ Superuser created:', superuser.username);

  // Create sample SMMM accounts
  const smmm1 = await prisma.sMMMAccount.upsert({
    where: { username: 'smmm1' },
    update: {},
    create: {
      superuserId: superuser.id,
      companyName: 'Örnek Mali Müşavirlik',
      username: 'smmm1',
      passwordHash: await bcrypt.hash('smmm123', 12),
      email: 'smmm1@example.com',
      phone: '+905551234567',
      address: 'İstanbul, Türkiye',
      subscriptionPlan: 'PROFESSIONAL',
      isActive: true,
    },
  });

  const smmm2 = await prisma.sMMMAccount.upsert({
    where: { username: 'smmm2' },
    update: {},
    create: {
      superuserId: superuser.id,
      companyName: 'Test Mali Müşavirlik',
      username: 'smmm2',
      passwordHash: await bcrypt.hash('smmm123', 12),
      email: 'smmm2@example.com',
      phone: '+905559876543',
      address: 'Ankara, Türkiye',
      subscriptionPlan: 'BASIC',
      isActive: true,
    },
  });

  console.log('✅ SMMM accounts created');

  // Create sample taxpayers
  const taxpayers = [
    {
      smmmId: smmm1.id,
      tcNumber: '12345678901',
      taxNumber: '1234567890',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      companyName: 'Yılmaz Ticaret A.Ş.',
      email: 'ahmet@example.com',
      phone: '+905551111111',
      address: 'İstanbul, Beşiktaş',
      monthlyFee: 500.00,
    },
    {
      smmmId: smmm1.id,
      tcNumber: '12345678902',
      taxNumber: '1234567891',
      firstName: 'Fatma',
      lastName: 'Demir',
      companyName: 'Demir İnşaat Ltd. Şti.',
      email: 'fatma@example.com',
      phone: '+905552222222',
      address: 'İstanbul, Kadıköy',
      monthlyFee: 750.00,
    },
    {
      smmmId: smmm2.id,
      tcNumber: '12345678903',
      taxNumber: '1234567892',
      firstName: 'Mehmet',
      lastName: 'Kaya',
      email: 'mehmet@example.com',
      phone: '+905553333333',
      address: 'Ankara, Çankaya',
      monthlyFee: 600.00,
    },
  ];

  for (const taxpayerData of taxpayers) {
    await prisma.taxpayer.upsert({
      where: { tcNumber: taxpayerData.tcNumber },
      update: {},
      create: taxpayerData,
    });
  }

  console.log('✅ Taxpayers created');

  // Create sample payments for current year
  const currentYear = new Date().getFullYear();
  const taxpayers_db = await prisma.taxpayer.findMany();

  for (const taxpayer of taxpayers_db) {
    // Create payments for last 3 months
    for (let month = 1; month <= 3; month++) {
      const paymentStatus = month === 1 ? 'PAID' : month === 2 ? 'PENDING' : 'OVERDUE';
      const paymentDate = month === 1 ? new Date(currentYear, month - 1, 15) : undefined;

      await prisma.payment.upsert({
        where: {
          taxpayerId_year_month: {
            taxpayerId: taxpayer.id,
            year: currentYear,
            month: month,
          },
        },
        update: {},
        create: {
          taxpayerId: taxpayer.id,
          smmmId: taxpayer.smmmId,
          year: currentYear,
          month: month,
          amount: taxpayer.monthlyFee,
          paymentStatus: paymentStatus as any,
          paymentDate,
          notes: `Aylık aidat - ${month}/${currentYear}`,
        },
      });
    }
  }

  console.log('✅ Payments created');

  // Create sample E-Devlet credentials
  for (const taxpayer of taxpayers_db) {
    await prisma.eDevletCredential.upsert({
      where: {
        taxpayerId_platform: {
          taxpayerId: taxpayer.id,
          platform: 'EARSIV_PORTAL',
        },
      },
      update: {},
      create: {
        taxpayerId: taxpayer.id,
        smmmId: taxpayer.smmmId,
        platform: 'EARSIV_PORTAL',
        username: `user_${taxpayer.tcNumber}`,
        passwordEncrypted: 'encrypted_password_here',
        isActive: true,
      },
    });
  }

  console.log('✅ E-Devlet credentials created');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('EARSIV_PORTAL', 'DIJITAL_GIB', 'ISTANBUL_GIB');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BEYANNAME', 'FATURA', 'SOZLESME', 'DIGER');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('PAYMENT_REMINDER', 'BEYANNAME_NOTIFICATION', 'GENERAL_MESSAGE');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "superusers" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "superusers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smmm_accounts" (
    "id" TEXT NOT NULL,
    "superuser_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "subscription_plan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smmm_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxpayers" (
    "id" TEXT NOT NULL,
    "smmm_id" TEXT NOT NULL,
    "tc_number" TEXT NOT NULL,
    "tax_number" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "monthly_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxpayers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "taxpayer_id" TEXT NOT NULL,
    "smmm_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edevlet_credentials" (
    "id" TEXT NOT NULL,
    "taxpayer_id" TEXT NOT NULL,
    "smmm_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "username" TEXT,
    "password_encrypted" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "edevlet_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "taxpayer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_messages" (
    "id" TEXT NOT NULL,
    "taxpayer_id" TEXT NOT NULL,
    "smmm_id" TEXT NOT NULL,
    "message_type" "MessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "file_path" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "superusers_username_key" ON "superusers"("username");

-- CreateIndex
CREATE UNIQUE INDEX "superusers_email_key" ON "superusers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "smmm_accounts_username_key" ON "smmm_accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "smmm_accounts_email_key" ON "smmm_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "taxpayers_tc_number_key" ON "taxpayers"("tc_number");

-- CreateIndex
CREATE UNIQUE INDEX "payments_taxpayer_id_year_month_key" ON "payments"("taxpayer_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "edevlet_credentials_taxpayer_id_platform_key" ON "edevlet_credentials"("taxpayer_id", "platform");

-- AddForeignKey
ALTER TABLE "smmm_accounts" ADD CONSTRAINT "smmm_accounts_superuser_id_fkey" FOREIGN KEY ("superuser_id") REFERENCES "superusers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxpayers" ADD CONSTRAINT "taxpayers_smmm_id_fkey" FOREIGN KEY ("smmm_id") REFERENCES "smmm_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_taxpayer_id_fkey" FOREIGN KEY ("taxpayer_id") REFERENCES "taxpayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_smmm_id_fkey" FOREIGN KEY ("smmm_id") REFERENCES "smmm_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edevlet_credentials" ADD CONSTRAINT "edevlet_credentials_taxpayer_id_fkey" FOREIGN KEY ("taxpayer_id") REFERENCES "taxpayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edevlet_credentials" ADD CONSTRAINT "edevlet_credentials_smmm_id_fkey" FOREIGN KEY ("smmm_id") REFERENCES "smmm_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_taxpayer_id_fkey" FOREIGN KEY ("taxpayer_id") REFERENCES "taxpayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

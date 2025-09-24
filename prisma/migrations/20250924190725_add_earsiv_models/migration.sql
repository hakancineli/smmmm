-- CreateTable
CREATE TABLE "earsiv_credentials" (
    "id" TEXT NOT NULL,
    "taxpayer_id" TEXT NOT NULL,
    "smmm_id" TEXT NOT NULL,
    "user_code" TEXT NOT NULL,
    "password_enc" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earsiv_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earsiv_invoices" (
    "id" TEXT NOT NULL,
    "taxpayer_id" TEXT NOT NULL,
    "smmm_id" TEXT NOT NULL,
    "uuid" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scenario" TEXT,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earsiv_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "earsiv_credentials_taxpayer_id_key" ON "earsiv_credentials"("taxpayer_id");

-- CreateIndex
CREATE INDEX "earsiv_invoices_taxpayer_id_idx" ON "earsiv_invoices"("taxpayer_id");

-- CreateIndex
CREATE INDEX "earsiv_invoices_smmm_id_idx" ON "earsiv_invoices"("smmm_id");

-- AddForeignKey
ALTER TABLE "earsiv_credentials" ADD CONSTRAINT "earsiv_credentials_taxpayer_id_fkey" FOREIGN KEY ("taxpayer_id") REFERENCES "taxpayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earsiv_credentials" ADD CONSTRAINT "earsiv_credentials_smmm_id_fkey" FOREIGN KEY ("smmm_id") REFERENCES "smmm_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earsiv_invoices" ADD CONSTRAINT "earsiv_invoices_taxpayer_id_fkey" FOREIGN KEY ("taxpayer_id") REFERENCES "taxpayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earsiv_invoices" ADD CONSTRAINT "earsiv_invoices_smmm_id_fkey" FOREIGN KEY ("smmm_id") REFERENCES "smmm_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

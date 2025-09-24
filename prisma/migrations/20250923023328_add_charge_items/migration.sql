-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "charge_items" (
    "id" TEXT NOT NULL,
    "taxpayer_id" TEXT NOT NULL,
    "smmm_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "ChargeStatus" NOT NULL DEFAULT 'PENDING',
    "due_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charge_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "charge_items" ADD CONSTRAINT "charge_items_taxpayer_id_fkey" FOREIGN KEY ("taxpayer_id") REFERENCES "taxpayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charge_items" ADD CONSTRAINT "charge_items_smmm_id_fkey" FOREIGN KEY ("smmm_id") REFERENCES "smmm_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

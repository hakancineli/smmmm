-- CreateTable
CREATE TABLE "taxpayer_notes" (
    "id" TEXT NOT NULL,
    "taxpayer_id" TEXT NOT NULL,
    "smmm_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxpayer_notes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "taxpayer_notes" ADD CONSTRAINT "taxpayer_notes_taxpayer_id_fkey" FOREIGN KEY ("taxpayer_id") REFERENCES "taxpayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxpayer_notes" ADD CONSTRAINT "taxpayer_notes_smmm_id_fkey" FOREIGN KEY ("smmm_id") REFERENCES "smmm_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "AIAdvice" DROP CONSTRAINT "AIAdvice_bonsaiId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_bonsaiId_fkey";

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_bonsaiId_fkey" FOREIGN KEY ("bonsaiId") REFERENCES "Bonsai"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAdvice" ADD CONSTRAINT "AIAdvice_bonsaiId_fkey" FOREIGN KEY ("bonsaiId") REFERENCES "Bonsai"("id") ON DELETE CASCADE ON UPDATE CASCADE;

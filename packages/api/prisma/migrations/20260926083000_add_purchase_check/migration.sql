CREATE TYPE "PurchaseExperience" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TABLE "PurchaseCheck" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "photoKeys" TEXT[] NOT NULL,
    "photoRoles" TEXT[] NOT NULL,
    "species" TEXT,
    "heightCm" INTEGER,
    "price" INTEGER,
    "sellerNote" TEXT,
    "experience" "PurchaseExperience" NOT NULL DEFAULT 'BEGINNER',
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PurchaseCheck_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PurchaseCheck_owner_createdAt_idx" ON "PurchaseCheck"("owner", "createdAt");

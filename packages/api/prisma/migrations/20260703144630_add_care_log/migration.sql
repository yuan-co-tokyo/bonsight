-- CreateEnum
CREATE TYPE "CareType" AS ENUM ('WATERING', 'FERTILIZING', 'PRUNING', 'WIRING', 'REPOTTING', 'PEST_CONTROL');

-- CreateTable
CREATE TABLE "CareLog" (
    "id" TEXT NOT NULL,
    "bonsaiId" TEXT NOT NULL,
    "type" "CareType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CareLog" ADD CONSTRAINT "CareLog_bonsaiId_fkey" FOREIGN KEY ("bonsaiId") REFERENCES "Bonsai"("id") ON DELETE CASCADE ON UPDATE CASCADE;

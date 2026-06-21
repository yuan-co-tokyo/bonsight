-- CreateEnum
CREATE TYPE "BonsaiVisibility" AS ENUM ('PRIVATE', 'UNLISTED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "cognitoSub" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "region" TEXT,
    "climatezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bonsai" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "visibility" "BonsaiVisibility" NOT NULL DEFAULT 'PRIVATE',
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "species" TEXT,
    "acquiredAt" TIMESTAMP(3),
    "estimatedAge" INTEGER,
    "origin" TEXT,
    "potInfo" TEXT,
    "style" TEXT,
    "currentState" TEXT,
    "coverImageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Bonsai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "bonsaiId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'PHOTO',
    "s3Key" TEXT NOT NULL,
    "caption" TEXT,
    "takenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAdvice" (
    "id" TEXT NOT NULL,
    "bonsaiId" TEXT NOT NULL,
    "mediaId" TEXT,
    "diagnosis" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_cognitoSub_key" ON "User"("cognitoSub");

-- AddForeignKey
ALTER TABLE "Bonsai" ADD CONSTRAINT "Bonsai_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_bonsaiId_fkey" FOREIGN KEY ("bonsaiId") REFERENCES "Bonsai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAdvice" ADD CONSTRAINT "AIAdvice_bonsaiId_fkey" FOREIGN KEY ("bonsaiId") REFERENCES "Bonsai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

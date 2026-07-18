-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'scan';

-- CreateTable
CREATE TABLE "DescribeRateLimit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DescribeRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DescribeAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DescribeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DescribeRateLimit_date_idx" ON "DescribeRateLimit"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DescribeRateLimit_userId_date_key" ON "DescribeRateLimit"("userId", "date");

-- CreateIndex
CREATE INDEX "DescribeAttempt_userId_idx" ON "DescribeAttempt"("userId");

-- AddForeignKey
ALTER TABLE "DescribeAttempt" ADD CONSTRAINT "DescribeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


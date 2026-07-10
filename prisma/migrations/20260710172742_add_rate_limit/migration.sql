-- CreateTable
CREATE TABLE "DefineRateLimit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE INDEX "DefineRateLimit_date_idx" ON "DefineRateLimit"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DefineRateLimit_ip_date_key" ON "DefineRateLimit"("ip", "date");

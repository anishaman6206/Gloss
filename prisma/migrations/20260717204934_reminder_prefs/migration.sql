-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reminderEmailsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastReminderSentAt" TIMESTAMP(3);

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireUser } from "./auth";

export async function setReminderPreference(enabled: boolean) {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { reminderEmailsEnabled: enabled },
  });
  revalidatePath("/profile");
  return { ok: true as const };
}

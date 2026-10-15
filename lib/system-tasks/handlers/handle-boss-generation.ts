import { SystemTask } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function handleBossGeneration(task: SystemTask, body: any) {
  console.log("Boss generation webhook body:", JSON.stringify(body, null, 2));

  return;
}
import { SystemTask } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function handleBossGeneration(task: SystemTask, body: any) {
  console.log("Boss generation webhook body:", JSON.stringify(body, null, 2));
  const taskId = task.id
  console.log("Task ID:", taskId)

  console.log("Deleting Task....");
  await prisma.systemTask.delete({
    where: { id: taskId }
  })
  console.log("Task Deleted....");
  return;
}
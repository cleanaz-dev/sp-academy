import { SystemTask } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import z from "zod";
import { pusherServer } from "@/lib/pusher-server";

export async function handleSpoonGeneration(task: SystemTask, body: unknown) {
    return
}
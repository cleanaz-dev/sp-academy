"use client"

import { useRouter } from "next/navigation"
import { BossFoundationProvider } from "@/context/boss-context"
import BossFoundationFreestyle from "./boss-foundation-freestyle"
import { BossData } from "@/app/(dashboard)/foundation/actions/get-boss-data"


export default function BossFoundationClient({
  session,
}: {
  session: NonNullable<BossData>
}) {
  const router = useRouter()
  const handleEnd = () => router.push("/foundation") // change to your destination

  return (
    <BossFoundationProvider session={session} onEnd={handleEnd}>
      <BossFoundationFreestyle onEnd={handleEnd} />
    </BossFoundationProvider>
  )
}
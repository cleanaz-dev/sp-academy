import { useSearchParams } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET() {
//   // get 'key' from search params
//   const audioKey = useSearchParams();

  return NextResponse.json({ message: "success" });
}

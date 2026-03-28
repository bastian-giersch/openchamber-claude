import { getProvider } from "@/lib/providers"
import { NextResponse } from "next/server"

export async function GET() {
  const provider = getProvider()
  const sessions = await provider.getSessions()
  return NextResponse.json(sessions)
}

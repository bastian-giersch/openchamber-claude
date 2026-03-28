import { getProvider } from "@/lib/providers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const provider = getProvider()
  const url = new URL(request.url)
  const sessionId = url.searchParams.get("sessionId") ?? undefined
  const diffs = await provider.getDiffs(sessionId)
  return NextResponse.json(diffs)
}

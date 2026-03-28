import { getProviderMode, setProviderMode } from "@/lib/providers"
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ mode: getProviderMode() })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { mode } = body as { mode: "mock" | "real" }

  if (!["mock", "real"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
  }

  setProviderMode(mode)
  return NextResponse.json({ mode: getProviderMode() })
}

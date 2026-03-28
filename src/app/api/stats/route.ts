import { getProvider } from "@/lib/providers"
import { NextResponse } from "next/server"

export async function GET() {
  const provider = getProvider()
  const stats = await provider.getDashboardStats()
  return NextResponse.json({
    ...stats,
    providerMode: "real",
  })
}

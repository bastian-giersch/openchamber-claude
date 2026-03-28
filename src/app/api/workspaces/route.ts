import { getProvider } from "@/lib/providers"
import { NextResponse } from "next/server"

export async function GET() {
  const provider = getProvider()
  const workspaces = await provider.getWorkspaces()
  return NextResponse.json(workspaces)
}

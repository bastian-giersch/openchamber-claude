import { getProvider } from "@/lib/providers"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const provider = getProvider()
  const session = await provider.getSession(id)
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [events, toolCalls, permissions] = await Promise.all([
    provider.getSessionEvents(id),
    provider.getSessionToolCalls(id),
    provider.getPendingPermissions(id),
  ])

  return NextResponse.json({ session, events, toolCalls, permissions })
}

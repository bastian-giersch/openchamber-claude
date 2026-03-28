import { getProvider } from "@/lib/providers"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status } = body as { status: "approved" | "rejected" }

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const provider = getProvider()
  await provider.reviewDiff(id, status)
  return NextResponse.json({ success: true })
}

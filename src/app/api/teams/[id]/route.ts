// GET, PATCH, DELETE /api/teams/[id]
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Implement GET /api/teams/[id]
  return NextResponse.json({ id })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Implement PATCH /api/teams/[id]
  return NextResponse.json({ success: true, id })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Implement DELETE /api/teams/[id]
  return NextResponse.json({ success: true, id })
}


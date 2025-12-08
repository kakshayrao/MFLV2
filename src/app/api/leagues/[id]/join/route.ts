// POST /api/leagues/[id]/join
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Implement POST /api/leagues/[id]/join
  return NextResponse.json({ success: true, id })
}


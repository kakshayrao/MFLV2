// GET /api/leagues/[id]/members
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Implement GET /api/leagues/[id]/members
  return NextResponse.json({ data: [], id })
}


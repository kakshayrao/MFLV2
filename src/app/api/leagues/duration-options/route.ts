/**
 * Public API for fetching active league duration options
 * GET - List active duration options (for league creation form)
 */

import { NextResponse } from 'next/server';
import { getActiveDurationOptions } from '@/lib/services/league-duration-options';

export async function GET() {
  try {
    const options = await getActiveDurationOptions();
    return NextResponse.json({ data: options, success: true });
  } catch (error) {
    console.error('Error fetching duration options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch duration options' },
      { status: 500 }
    );
  }
}


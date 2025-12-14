/**
 * Admin API for managing league duration options
 * GET - List all duration options
 * POST - Create a new duration option
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import {
  getAllDurationOptions,
  createDurationOption,
} from '@/lib/services/league-duration-options';
import { z } from 'zod';

const createDurationOptionSchema = z.object({
  duration_days: z.number().int().positive().min(1).max(365),
  display_name: z.string().min(1),
  display_order: z.number().int().nonnegative().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as import('next-auth').Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user is admin
    // For now, allow any authenticated user (should be restricted to admin)

    const options = await getAllDurationOptions();
    return NextResponse.json({ data: options, success: true });
  } catch (error) {
    console.error('Error fetching duration options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch duration options' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as import('next-auth').Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user is admin

    const body = await req.json();
    const validated = createDurationOptionSchema.parse(body);

    const option = await createDurationOption(
      validated.duration_days,
      validated.display_name,
      validated.display_order || 0
    );

    if (!option) {
      return NextResponse.json(
        { error: 'Failed to create duration option' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: option, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating duration option:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create duration option' },
      { status: 500 }
    );
  }
}


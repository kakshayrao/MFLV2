/**
 * Admin API for updating/deleting league duration options
 * PATCH - Update a duration option
 * DELETE - Delete a duration option
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import {
  updateDurationOption,
  deleteDurationOption,
} from '@/lib/services/league-duration-options';
import { z } from 'zod';

const updateDurationOptionSchema = z.object({
  duration_days: z.number().int().positive().min(1).max(365).optional(),
  display_name: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().nonnegative().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions as any)) as import('next-auth').Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user is admin

    const { id } = await params;
    const body = await req.json();
    const validated = updateDurationOptionSchema.parse(body);

    const option = await updateDurationOption(id, validated);

    if (!option) {
      return NextResponse.json(
        { error: 'Failed to update duration option' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: option, success: true });
  } catch (error) {
    console.error('Error updating duration option:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update duration option' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions as any)) as import('next-auth').Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user is admin

    const { id } = await params;
    const success = await deleteDurationOption(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete duration option' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting duration option:', error);
    return NextResponse.json(
      { error: 'Failed to delete duration option' },
      { status: 500 }
    );
  }
}


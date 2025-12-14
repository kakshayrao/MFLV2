/**
 * GET /api/leagues - List user's leagues
 * POST /api/leagues - Create a new league (Host role required)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { getLeaguesForUser, createLeague } from '@/lib/services/leagues';
import { z } from 'zod';

const createLeagueSchema = z.object({
  league_name: z.string().min(1, 'League name required'),
  duration_days: z.number().int().positive().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as import('next-auth').Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leagues = await getLeaguesForUser(session.user.id);
    return NextResponse.json({ data: leagues, success: true });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
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

    const body = await req.json();
    const validated = createLeagueSchema.parse(body);

    // Don't set start_date and end_date yet - user will choose after payment
    const league = await createLeague(session.user.id, {
      league_name: validated.league_name,
      start_date: null, // Will be set after payment
      end_date: null,   // Will be calculated after payment
      duration_days: validated.duration_days,
    });
    if (!league) {
      return NextResponse.json(
        { error: 'Failed to create league' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: league, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating league:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create league' },
      { status: 500 }
    );
  }
}


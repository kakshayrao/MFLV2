/**
 * POST /api/leagues/join-by-code - Join a league using a league code
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { createServerClient } from '@/lib/supabase/server';
import { addLeagueMember } from '@/lib/services/memberships';

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as import('next-auth').Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'League code is required' },
        { status: 400 }
      );
    }

    // Find league by code
    const supabase = createServerClient();
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('league_code', code.trim().toUpperCase())
      .single();

    if (leagueError || !league) {
      return NextResponse.json(
        { error: 'Invalid league code' },
        { status: 404 }
      );
    }

    // Check if league is open for joining
    if (league.status === 'completed') {
      return NextResponse.json(
        { error: 'This league has ended' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('leaguemembers')
      .select('id')
      .eq('league_id', league.league_id)
      .eq('user_id', session.user.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this league' },
        { status: 400 }
      );
    }

    // Add user to league
    const member = await addLeagueMember(session.user.id, league.league_id, undefined, session.user.id);
    if (!member) {
      return NextResponse.json(
        { error: 'Failed to join league' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      leagueId: league.league_id,
      leagueName: league.league_name,
    });
  } catch (error) {
    console.error('Error joining league:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

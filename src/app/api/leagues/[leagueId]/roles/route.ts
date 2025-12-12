import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createServerClient } from '@/lib/supabase/server';
import { Role } from '@/contexts/role-context';

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const session = (await getServerSession(authOptions as any)) as { user: { id: string } } | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    const supabase = await createServerClient();

    const roles: Role[] = [];

    // 1. Check if user is league creator (automatic host)
    const { data: league } = await supabase
      .from('leagues')
      .select('created_by')
      .eq('league_id', params.leagueId)
      .single();

    if (league?.created_by === userId) {
      roles.push('host');
    }

    // 2. Check assignedrolesforleague for Host/Governor roles
    const { data: leagueRoles } = await supabase
      .from('assignedrolesforleague')
      .select(`
        role_id,
        roles:role_id (
          role_name
        )
      `)
      .eq('league_id', params.leagueId)
      .eq('user_id', userId);

    if (leagueRoles) {
      for (const assignment of leagueRoles) {
        const roleName = (assignment.roles as any)?.role_name?.toLowerCase();
        if (roleName === 'host' && !roles.includes('host')) {
          roles.push('host');
        } else if (roleName === 'governor' && !roles.includes('governor')) {
          roles.push('governor');
        }
      }
    }

    // 3. Check teammembers for Captain/Player roles
    const { data: teamMemberships } = await supabase
      .from('teammembers')
      .select(`
        role_id,
        team_id,
        roles:role_id (
          role_name
        )
      `)
      .eq('user_id', userId);

    if (teamMemberships) {
      for (const membership of teamMemberships) {
        // Verify this team is in the specified league
        const { data: teamLeague } = await supabase
          .from('teamleagues')
          .select('league_id')
          .eq('team_id', membership.team_id)
          .eq('league_id', params.leagueId)
          .single();

        if (teamLeague) {
          const roleName = (membership.roles as any)?.role_name?.toLowerCase();
          if (roleName === 'captain' && !roles.includes('captain')) {
            roles.push('captain');
          } else if (roleName === 'player' && !roles.includes('player')) {
            roles.push('player');
          }
        }
      }
    }

    // 4. Check leaguemembers for basic player role if no other roles
    if (roles.length === 0) {
      const { data: leagueMember } = await supabase
        .from('leaguemembers')
        .select('league_member_id')
        .eq('league_id', params.leagueId)
        .eq('user_id', userId)
        .single();

      if (leagueMember) {
        roles.push('player');
      }
    }

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Error in roles API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

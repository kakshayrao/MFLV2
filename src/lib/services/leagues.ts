/**
 * League Service Layer
 * Handles all league CRUD operations and queries.
 * Centralizes DB logic to avoid duplication across API routes and components.
 */

import { getSupabase } from '@/lib/supabase/client';

export interface LeagueInput {
  league_name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  is_exclusive?: boolean;
  is_public?: boolean;
  num_teams?: number;
  team_size?: number;
  rest_days?: number;
  stripe_product_id?: string;
}

export interface League extends LeagueInput {
  league_id: string;
  host_id: string;
  status: 'draft' | 'launched' | 'active' | 'completed';
  is_active: boolean;
  created_by: string;
  created_date: string;
  modified_by: string;
  modified_date: string;
}

/**
 * Create a new league
 * @param userId - User ID (will be set as host)
 * @param data - League creation data
 * @returns Created league object
 */
export async function createLeague(userId: string, data: LeagueInput): Promise<League | null> {
  try {
    const supabase = getSupabase();
    
    // Generate a unique league code (6 characters: ABC123)
    const generateLeagueCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    const leagueCode = generateLeagueCode();
    
    const { data: league, error } = await supabase
      .from('leagues')
      .insert({
        league_name: data.league_name,
        start_date: data.start_date,
        end_date: data.end_date,
        is_exclusive: data.is_exclusive ?? false,
        is_public: data.is_public ?? true,
        num_teams: data.num_teams,
        team_size: data.team_size,
        rest_days: data.rest_days ?? 0,
        stripe_product_id: data.stripe_product_id,
        league_code: leagueCode,
        status: 'draft',
        is_active: true,
        host_id: userId,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating league:', error);
      return null;
    }

    // Assign user as host in assignedrolesforleague
    if (league) {
      await assignRoleToUser(userId, league.league_id, 'host', userId);
    }

    return league as League;
  } catch (err) {
    console.error('League creation error:', err);
    return null;
  }
}

/**
 * Get a single league by ID
 * @param leagueId - League ID
 * @returns League object or null
 */
export async function getLeagueById(leagueId: string): Promise<League | null> {
  try {
    const { data, error } = await getSupabase()
      .from('leagues')
      .select('*')
      .eq('league_id', leagueId)
      .single();

    if (error) return null;
    return data as League;
  } catch (err) {
    console.error('Error fetching league:', err);
    return null;
  }
}

/**
 * Get all leagues for a user
 * @param userId - User ID
 * @returns Array of leagues the user is a member of
 */
export async function getLeaguesForUser(userId: string): Promise<League[]> {
  try {
    const { data, error } = await getSupabase()
      .from('leaguemembers')
      .select('league_id, leagues(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user leagues:', error);
      return [];
    }

    // Extract and deduplicate leagues (user may have multiple roles)
    const leaguesMap = new Map<string, League>();
    (data || []).forEach((row: any) => {
      if (row.leagues) {
        leaguesMap.set(row.leagues.league_id, row.leagues as League);
      }
    });

    return Array.from(leaguesMap.values());
  } catch (err) {
    console.error('Error fetching user leagues:', err);
    return [];
  }
}

/**
 * Update a league
 * @param leagueId - League ID
 * @param userId - User ID (must be host to update)
 * @param data - Partial league data to update
 * @returns Updated league or null
 */
export async function updateLeague(
  leagueId: string,
  userId: string,
  data: Partial<LeagueInput>
): Promise<League | null> {
  try {
    // Verify user is host
    const league = await getLeagueById(leagueId);
    if (!league) return null;

    const userRole = await getUserRoleInLeague(userId, leagueId);
    if (userRole !== 'host') {
      console.error('User is not host of league');
      return null;
    }

    // Prevent updates after league launch
    if (league.status !== 'draft') {
      console.error('Cannot update league after launch');
      return null;
    }

    const { data: updated, error } = await getSupabase()
      .from('leagues')
      .update({
        ...data,
        modified_by: userId,
        modified_date: new Date().toISOString(),
      })
      .eq('league_id', leagueId)
      .select()
      .single();

    if (error) {
      console.error('Error updating league:', error);
      return null;
    }

    return updated as League;
  } catch (err) {
    console.error('Error updating league:', err);
    return null;
  }
}

/**
 * Delete a league (host only, before launch)
 * @param leagueId - League ID
 * @param userId - User ID (must be host)
 * @returns Success boolean
 */
export async function deleteLeague(leagueId: string, userId: string): Promise<boolean> {
  try {
    const league = await getLeagueById(leagueId);
    if (!league) return false;

    const userRole = await getUserRoleInLeague(userId, leagueId);
    if (userRole !== 'host') {
      console.error('User is not host of league');
      return false;
    }

    if (league.status !== 'draft') {
      console.error('Cannot delete league after launch');
      return false;
    }

    const { error } = await getSupabase()
      .from('leagues')
      .delete()
      .eq('league_id', leagueId);

    return !error;
  } catch (err) {
    console.error('Error deleting league:', err);
    return false;
  }
}

/**
 * Launch a league (change status from draft to launched)
 * @param leagueId - League ID
 * @param userId - User ID (must be host)
 * @returns Updated league or null
 */
export async function launchLeague(leagueId: string, userId: string): Promise<League | null> {
  try {
    const league = await getLeagueById(leagueId);
    if (!league) return null;

    const userRole = await getUserRoleInLeague(userId, leagueId);
    if (userRole !== 'host') {
      console.error('User is not host of league');
      return null;
    }

    const { data, error } = await getSupabase()
      .from('leagues')
      .update({
        status: 'launched',
        modified_by: userId,
        modified_date: new Date().toISOString(),
      })
      .eq('league_id', leagueId)
      .select()
      .single();

    if (error) {
      console.error('Error launching league:', error);
      return null;
    }

    return data as League;
  } catch (err) {
    console.error('Error launching league:', err);
    return null;
  }
}

/**
 * Get user's role in a specific league
 * @param userId - User ID
 * @param leagueId - League ID
 * @returns Role name or null if user is not a member
 */
export async function getUserRoleInLeague(
  userId: string,
  leagueId: string
): Promise<string | null> {
  try {
    const { data, error } = await getSupabase()
      .from('assignedrolesforleague')
      .select('roles(role_name)')
      .eq('user_id', userId)
      .eq('league_id', leagueId)
      .maybeSingle();

    if (error || !data) return null;
    return (data as any).roles?.role_name ?? null;
  } catch (err) {
    console.error('Error fetching user role:', err);
    return null;
  }
}

/**
 * Get all roles assigned to a user in a league
 * @param userId - User ID
 * @param leagueId - League ID
 * @returns Array of role names
 */
export async function getUserRolesInLeague(
  userId: string,
  leagueId: string
): Promise<string[]> {
  try {
    const { data, error } = await getSupabase()
      .from('assignedrolesforleague')
      .select('roles(role_name)')
      .eq('user_id', userId)
      .eq('league_id', leagueId);

    if (error) return [];
    return (data || []).map((row: any) => row.roles?.role_name).filter(Boolean);
  } catch (err) {
    console.error('Error fetching user roles:', err);
    return [];
  }
}

/**
 * Assign a role to a user in a league
 * @param userId - User ID
 * @param leagueId - League ID
 * @param roleName - Role name (e.g., 'host', 'governor', 'captain', 'player')
 * @param assignedBy - User ID of who is assigning the role
 * @returns Success boolean
 */
export async function assignRoleToUser(
  userId: string,
  leagueId: string,
  roleName: string,
  assignedBy: string
): Promise<boolean> {
  try {
    // Get role_id from role_name
    const { data: roleData, error: roleError } = await getSupabase()
      .from('roles')
      .select('role_id')
      .eq('role_name', roleName)
      .single();

    if (roleError || !roleData) {
      console.error('Role not found:', roleName);
      return false;
    }

    // Check if assignment already exists
    const { data: existing } = await getSupabase()
      .from('assignedrolesforleague')
      .select('id')
      .eq('user_id', userId)
      .eq('league_id', leagueId)
      .eq('role_id', roleData.role_id)
      .maybeSingle();

    if (existing) {
      // Already assigned
      return true;
    }

    const { error } = await getSupabase()
      .from('assignedrolesforleague')
      .insert({
        user_id: userId,
        league_id: leagueId,
        role_id: roleData.role_id,
        created_by: assignedBy,
      });

    return !error;
  } catch (err) {
    console.error('Error assigning role:', err);
    return false;
  }
}

/**
 * Remove a role from a user in a league
 * @param userId - User ID
 * @param leagueId - League ID
 * @param roleName - Role name
 * @returns Success boolean
 */
export async function removeRoleFromUser(
  userId: string,
  leagueId: string,
  roleName: string
): Promise<boolean> {
  try {
    const { data: roleData, error: roleError } = await getSupabase()
      .from('roles')
      .select('role_id')
      .eq('role_name', roleName)
      .single();

    if (roleError || !roleData) return false;

    const { error } = await getSupabase()
      .from('assignedrolesforleague')
      .delete()
      .eq('user_id', userId)
      .eq('league_id', leagueId)
      .eq('role_id', roleData.role_id);

    return !error;
  } catch (err) {
    console.error('Error removing role:', err);
    return false;
  }
}

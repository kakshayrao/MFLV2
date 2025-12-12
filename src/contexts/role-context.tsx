'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export type Role = 'host' | 'governor' | 'captain' | 'player';

interface RoleContextType {
  activeRole: Role | null;
  availableRoles: Role[];
  setActiveRole: (role: Role) => void;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
  leagueId?: string; // REQUIRED: Roles are league-specific, not global
}

/**
 * RoleProvider manages user roles within a SPECIFIC league context
 * 
 * IMPORTANT: Roles are league-scoped, not global:
 * - A user can be 'host' in League A but 'player' in League B
 * - Permissions only apply within the specific league
 * - Only system admins have cross-league access
 */
export function RoleProvider({ children, leagueId }: RoleProviderProps) {
  const { data: session } = useSession();
  const [activeRole, setActiveRoleState] = useState<Role | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!session?.user?.id || !leagueId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch from the actual database tables: assignedrolesforleague, teammembers, leaguemembers
        const response = await fetch(`/api/leagues/${leagueId}/roles?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          const roles = data.roles as Role[];
          setAvailableRoles(roles);

          // Set active role from localStorage or default to highest role
          const savedRole = localStorage.getItem(`activeRole_${leagueId}`);
          if (savedRole && roles.includes(savedRole as Role)) {
            setActiveRoleState(savedRole as Role);
          } else if (roles.length > 0) {
            // Default to highest role in hierarchy
            const hierarchy: Role[] = ['host', 'governor', 'captain', 'player'];
            const highestRole = hierarchy.find(role => roles.includes(role));
            setActiveRoleState(highestRole || roles[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user roles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [session?.user?.id, leagueId]);

  const setActiveRole = (role: Role) => {
    if (availableRoles.includes(role)) {
      setActiveRoleState(role);
      if (leagueId) {
        localStorage.setItem(`activeRole_${leagueId}`, role);
      }
    }
  };

  return (
    <RoleContext.Provider value={{ activeRole, availableRoles, setActiveRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Shield, 
  Users, 
  User, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';
import { Role } from '@/contexts/role-context';
import { getRoleDisplayName, getRoleDescription } from '@/lib/rbac/permissions';

interface UserMembership {
  id: string;
  user_id: string;
  username: string;
  email: string;
  role: Role;
  status: string;
}

const roleIcons: Record<Role, React.ComponentType<{ className?: string }>> = {
  host: Crown,
  governor: Shield,
  captain: Users,
  player: User,
};

const roleColors: Record<Role, string> = {
  host: 'bg-amber-100 text-amber-800 border-amber-300',
  governor: 'bg-blue-100 text-blue-800 border-blue-300',
  captain: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  player: 'bg-gray-100 text-gray-800 border-gray-300',
};

export default function RoleManagementPage() {
  const searchParams = useSearchParams();
  const leagueId = searchParams.get('leagueId');
  
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (leagueId) {
      fetchMemberships();
    }
  }, [leagueId]);

  const fetchMemberships = async () => {
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}/memberships`);
      if (response.ok) {
        const data = await response.json();
        setMemberships(data.memberships || []);
      }
    } catch (error) {
      console.error('Failed to fetch memberships:', error);
      setMessage({ type: 'error', text: 'Failed to load memberships' });
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (membershipId: string, newRole: Role) => {
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}/memberships/${membershipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Role updated successfully' });
        fetchMemberships();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update role' });
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      setMessage({ type: 'error', text: 'Failed to update role' });
    }
  };

  const removeMembership = async (membershipId: string) => {
    if (!confirm('Are you sure you want to remove this membership?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}/memberships/${membershipId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Membership removed successfully' });
        fetchMemberships();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to remove membership' });
      }
    } catch (error) {
      console.error('Failed to remove membership:', error);
      setMessage({ type: 'error', text: 'Failed to remove membership' });
    }
  };

  if (!leagueId) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>Please select a league from the URL: ?leagueId=YOUR_LEAGUE_ID</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Role Management
          </h1>
          <p className="text-gray-600">
            Manage user roles for this league
          </p>
        </div>

        {message && (
          <Card className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                Loading memberships...
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {memberships.map((membership) => {
              const RoleIcon = roleIcons[membership.role];
              
              return (
                <Card key={membership.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${roleColors[membership.role]} border`}>
                          <RoleIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {membership.username || membership.email}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {membership.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right mr-4">
                          <div className="text-sm font-medium capitalize">
                            {getRoleDisplayName(membership.role)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getRoleDescription(membership.role).split(' - ')[0]}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {(['host', 'governor', 'captain', 'player'] as Role[]).map((role) => (
                            <Button
                              key={role}
                              size="sm"
                              variant={membership.role === role ? 'default' : 'outline'}
                              onClick={() => updateRole(membership.id, role)}
                              disabled={membership.role === role}
                              title={getRoleDisplayName(role)}
                            >
                              {React.createElement(roleIcons[role], { className: 'w-4 h-4' })}
                            </Button>
                          ))}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => removeMembership(membership.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {memberships.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    No memberships found for this league
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

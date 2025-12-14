"use client";

import { useState, useEffect, use, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

interface League {
  league_id: string;
  league_name: string;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  is_public?: boolean;
  is_exclusive?: boolean;
  num_teams?: number;
  team_size?: number;
  rest_days?: number;
  is_active: boolean;
}

interface Team {
  team_id: string;
  team_name: string;
  color?: string; // Will be added by migration
  member_count?: number; // Calculated, not stored
}

type Tab = "general" | "teams" | "members" | "settings" | "danger";

function EditLeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewLeague = searchParams.get("success") === "true";

  const [tab, setTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(isNewLeague ? "League created successfully!" : "");

  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  // Form state - only include fields that exist in schema
  const [formData, setFormData] = useState({
    league_name: "",
    start_date: "",
    end_date: "",
    is_public: true, // Will be added by migration
    is_exclusive: false, // Will be added by migration
    num_teams: 4, // Will be added by migration
    team_size: 10, // Will be added by migration
    rest_days: 2, // Will be added by migration
  });

  const [tempStartDate, setTempStartDate] = useState("");

  // New team form
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamColor, setNewTeamColor] = useState("#3B82F6");

  useEffect(() => {
    fetchLeague();
    fetchTeams();
  }, [id]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-calculate end date when start date changes
  useEffect(() => {
    if (tempStartDate && league?.duration_days) {
      const start = new Date(tempStartDate);
      const end = new Date(start);
      end.setDate(end.getDate() + league.duration_days - 1);
      setFormData(prev => ({
        ...prev,
        start_date: tempStartDate,
        end_date: end.toISOString().split('T')[0],
      }));
    }
  }, [tempStartDate, league?.duration_days]);

  const fetchLeague = async () => {
    try {
      const res = await fetch(`/api/leagues/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setLeague(data.data);
        setFormData({
          league_name: data.data.league_name,
          start_date: data.data.start_date || "",
          end_date: data.data.end_date || "",
          is_public: data.data.is_public ?? true,
          is_exclusive: data.data.is_exclusive ?? false,
          num_teams: data.data.num_teams ?? 4,
          team_size: data.data.team_size ?? 10,
          rest_days: data.data.rest_days ?? 2,
        });
        if (data.data.start_date) {
          setTempStartDate(data.data.start_date);
        }
      }
    } catch (err) {
      setError("Failed to load league");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch(`/api/leagues/${id}/members`);
      const data = await res.json();
      // For now, we'll use placeholder teams
      setTeams([]);
    } catch (err) {
      console.error("Failed to fetch teams");
    }
  };

  const handleSave = async () => {
    if (league?.is_active) {
      setError("Cannot edit league after it has been launched");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/leagues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update league");
      }

      setSuccess("Changes saved successfully!");
      setLeague(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLaunch = async () => {
    // Validate that dates are set
    if (!formData.start_date || !formData.end_date) {
      setError("Please set the league start and end dates before launching.");
      return;
    }

    if (!confirm("Are you sure you want to launch this league? You won't be able to edit most settings after launch.")) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/leagues/${id}/launch`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to launch league");
      }

      setSuccess("League launched successfully!");
      setLeague(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this league? This action cannot be undone.")) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/leagues/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete league");
      }

      router.push("/leagues?deleted=true");
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;

    // TODO: API call to create team
    setTeams([
      ...teams,
      {
        team_id: `temp-${Date.now()}`,
        team_name: newTeamName,
        color: newTeamColor, // Will be saved to database after migration
        member_count: 0, // Calculated, not stored
      },
    ]);
    setNewTeamName("");
    setSuccess("Team added successfully!");
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/leagues/${id}/join`;
    navigator.clipboard.writeText(link);
    setSuccess("Invite link copied to clipboard!");
  };

  if (loading) {
    return (
      <>
        <Navbar navLinks={[]} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </>
    );
  }

  if (!league) {
    return (
      <>
        <Navbar navLinks={[]} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">League not found</p>
            <Button onClick={() => router.push("/leagues")}>Back to Leagues</Button>
          </div>
        </div>
      </>
    );
  }

  const isDraft = !league.is_active;
  const datesNotSet = !league.start_date || !league.end_date;
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  };

  return (
    <>
      <Navbar navLinks={[]} />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{league.league_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    !league.is_active
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {!league.is_active ? "Draft" : "Active"}
                </span>
                {league.start_date && league.end_date ? (
                  <span className="text-sm text-gray-500">
                    {league.start_date} - {league.end_date}
                  </span>
                ) : (
                  <span className="text-sm text-orange-600 font-medium">
                    Dates not set
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!isDraft && (
                <Button variant="outline" onClick={copyInviteLink}>
                  Copy Invite Link
                </Button>
              )}
              {isDraft && (
                <Button 
                  onClick={handleLaunch} 
                  disabled={datesNotSet || saving}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base px-6 py-2.5 font-semibold"
                >
                  {saving ? "Launching..." : "🚀 Launch League"}
                </Button>
              )}
            </div>
          </div>

          {/* Prominent Launch Banner if dates not set */}
          {isDraft && datesNotSet && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">
                    Set League Dates to Launch
                  </h3>
                  <p className="text-sm text-amber-700 mb-4">
                    Before launching your league, please set the start and end dates. The end date will be automatically calculated based on your selected duration ({league.duration_days} days).
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-2">
                        League Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        min={getMinDate()}
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="w-full border border-amber-300 rounded-lg px-4 py-2.5 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-200 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-2">
                        League End Date (Auto-calculated)
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        disabled
                        className="w-full border border-amber-300 rounded-lg px-4 py-2.5 bg-amber-50 text-amber-700 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  {tempStartDate && formData.end_date && (
                    <div className="mt-4 bg-white border border-amber-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-amber-700 mb-1">Schedule Preview</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-amber-600">Start:</p>
                          <p className="font-semibold text-amber-900">
                            {new Date(tempStartDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-amber-600">End:</p>
                          <p className="font-semibold text-amber-900">
                            {new Date(formData.end_date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <Button
                      onClick={handleSave}
                      disabled={!tempStartDate || saving}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {saving ? "Saving..." : "Save Dates"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {success}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-6">
              {[
                { key: "general", label: "General" },
                { key: "teams", label: "Teams" },
                { key: "members", label: "Members" },
                { key: "settings", label: "Settings" },
                { key: "danger", label: "Danger Zone" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key as Tab)}
                  className={`pb-3 text-sm font-medium border-b-2 ${
                    tab === key
                      ? "border-black text-gray-900"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* General Tab */}
            {tab === "general" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    League Name
                  </label>
                  <input
                    type="text"
                    disabled={!isDraft}
                    value={formData.league_name}
                    onChange={(e) => updateField("league_name", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date {league.duration_days && <span className="text-gray-500">(Duration: {league.duration_days} days)</span>}
                    </label>
                    <input
                      type="date"
                      min={getMinDate()}
                      disabled={!isDraft}
                      value={tempStartDate || formData.start_date}
                      onChange={(e) => {
                        setTempStartDate(e.target.value);
                        if (league?.duration_days) {
                          const start = new Date(e.target.value);
                          const end = new Date(start);
                          end.setDate(end.getDate() + league.duration_days - 1);
                          updateField("start_date", e.target.value);
                          updateField("end_date", end.toISOString().split('T')[0]);
                        } else {
                          updateField("start_date", e.target.value);
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {league.duration_days && (
                      <p className="text-xs text-gray-500 mt-1">
                        End date will be auto-calculated
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date {league.duration_days && <span className="text-gray-500">(Auto-calculated)</span>}
                    </label>
                    <input
                      type="date"
                      disabled={!isDraft || !!league.duration_days}
                      value={formData.end_date}
                      onChange={(e) => updateField("end_date", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {league.duration_days && (
                      <p className="text-xs text-gray-500 mt-1">
                        Calculated from start date + {league.duration_days} days
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Teams
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="20"
                      disabled={!isDraft}
                      value={formData.num_teams}
                      onChange={(e) => updateField("num_teams", parseInt(e.target.value) || 2)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      disabled={!isDraft}
                      value={formData.team_size}
                      onChange={(e) => updateField("team_size", parseInt(e.target.value) || 1)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rest Days per Week
                  </label>
                  <select
                    disabled={!isDraft}
                    value={formData.rest_days}
                    onChange={(e) => updateField("rest_days", parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value={0}>0 rest days</option>
                    <option value={1}>1 rest day</option>
                    <option value={2}>2 rest days</option>
                    <option value={3}>3 rest days</option>
                  </select>
                </div>

                {isDraft && (
                  <div className="pt-4">
                    <Button onClick={handleSave} disabled={saving} className="bg-black text-white">
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}

                {!isDraft && (
                  <p className="text-sm text-gray-500 pt-4">
                    League settings cannot be modified after launch.
                  </p>
                )}
              </div>
            )}

            {/* Teams Tab */}
            {tab === "teams" && (
              <div className="space-y-6">
                {isDraft && (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Team name"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none"
                    />
                    <input
                      type="color"
                      value={newTeamColor}
                      onChange={(e) => setNewTeamColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <Button onClick={handleAddTeam} className="bg-black text-white">
                      Add Team
                    </Button>
                  </div>
                )}

                {teams.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No teams created yet</p>
                    {isDraft && (
                      <p className="text-sm mt-1">Add teams above to get started</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <div
                        key={team.team_id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {team.color && (
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: team.color }}
                            />
                          )}
                          <span className="font-medium text-gray-900">{team.team_name}</span>
                          {team.member_count !== undefined && (
                            <span className="text-sm text-gray-500">
                              {team.member_count} members
                            </span>
                          )}
                        </div>
                        {isDraft && (
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Members Tab */}
            {tab === "members" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">League Members</h3>
                  <Button variant="outline" onClick={copyInviteLink}>
                    Invite Members
                  </Button>
                </div>

                <div className="text-center py-12 text-gray-500">
                  <p>No members yet</p>
                  <p className="text-sm mt-1">Share the invite link to add members</p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {tab === "settings" && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isDraft}
                      checked={formData.is_public}
                      onChange={(e) => updateField("is_public", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Public League</p>
                      <p className="text-xs text-gray-500">
                        Anyone can discover and request to join
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isDraft}
                      checked={formData.is_exclusive}
                      onChange={(e) => updateField("is_exclusive", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Exclusive League</p>
                      <p className="text-xs text-gray-500">Members need approval to join</p>
                    </div>
                  </label>
                </div>

                {isDraft && (
                  <div className="pt-4">
                    <Button onClick={handleSave} disabled={saving} className="bg-black text-white">
                      {saving ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Danger Zone Tab */}
            {tab === "danger" && (
              <div className="space-y-6">
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Delete League</h3>
                  <p className="text-sm text-red-600 mb-4">
                    Once you delete a league, there is no going back. Please be certain.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={saving || league.is_active}
                    className="border-red-300 text-red-600"
                  >
                    {saving ? "Deleting..." : "Delete this league"}
                  </Button>
                  {league.is_active && (
                    <p className="text-xs text-red-500 mt-2">
                      Only draft leagues can be deleted.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function EditLeagueWrapper({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <EditLeaguePage params={params} />
    </Suspense>
  );
}

export default EditLeagueWrapper;


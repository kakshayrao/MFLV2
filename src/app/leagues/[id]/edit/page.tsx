"use client";

import { useState, useEffect, use, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

interface League {
  league_id: string;
  league_name: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  is_exclusive: boolean;
  num_teams: number;
  team_size: number;
  rest_days: number;
  status: "draft" | "launched" | "active" | "completed";
  host_id: string;
}

interface Team {
  team_id: string;
  team_name: string;
  color: string;
  member_count: number;
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

  // Form state
  const [formData, setFormData] = useState({
    league_name: "",
    start_date: "",
    end_date: "",
    is_public: true,
    is_exclusive: false,
    num_teams: 4,
    team_size: 10,
    rest_days: 2,
  });

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

  const fetchLeague = async () => {
    try {
      const res = await fetch(`/api/leagues/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setLeague(data.data);
        setFormData({
          league_name: data.data.league_name,
          start_date: data.data.start_date,
          end_date: data.data.end_date,
          is_public: data.data.is_public,
          is_exclusive: data.data.is_exclusive,
          num_teams: data.data.num_teams || 4,
          team_size: data.data.team_size || 10,
          rest_days: data.data.rest_days || 2,
        });
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
    if (league?.status !== "draft") {
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
        color: newTeamColor,
        member_count: 0,
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

  const isDraft = league.status === "draft";

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
                    league.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : league.status === "launched"
                      ? "bg-blue-100 text-blue-800"
                      : league.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {league.status.charAt(0).toUpperCase() + league.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  {league.start_date} - {league.end_date}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyInviteLink}>
                Copy Invite Link
              </Button>
              {isDraft && (
                <Button onClick={handleLaunch} className="bg-green-600 text-white">
                  Launch League
                </Button>
              )}
            </div>
          </div>

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
                      Start Date
                    </label>
                    <input
                      type="date"
                      disabled={!isDraft}
                      value={formData.start_date}
                      onChange={(e) => updateField("start_date", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      disabled={!isDraft}
                      value={formData.end_date}
                      onChange={(e) => updateField("end_date", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
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
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="font-medium text-gray-900">{team.team_name}</span>
                          <span className="text-sm text-gray-500">
                            {team.member_count} members
                          </span>
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
                    disabled={saving || league.status !== "draft"}
                    className="border-red-300 text-red-600"
                  >
                    {saving ? "Deleting..." : "Delete this league"}
                  </Button>
                  {league.status !== "draft" && (
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


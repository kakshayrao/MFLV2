"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/signin");
      return;
    }

    // Load user data
    (async () => {
      setIsLoadingData(true);
      const { data: user, error: fetchError } = await getSupabase()
        .from("users")
        .select("username, email, date_of_birth, gender, phone")
        .eq("user_id", session.user.id)
        .single();

      if (fetchError) {
        setError("Failed to load profile data");
        setIsLoadingData(false);
        return;
      }

      if (user) {
        setUsername((user as any).username || "");
        setEmail((user as any).email || "");
        setDateOfBirth((user as any).date_of_birth || "");
        setGender((user as any).gender || "");
        setPhone((user as any).phone || "");
      }
      setIsLoadingData(false);
    })();
  }, [session, router]);

  const onUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Validation
    if (!username.trim()) {
      setError("Username is required");
      setIsLoading(false);
      return;
    }

    if (!dateOfBirth) {
      setError("Date of birth is required");
      setIsLoading(false);
      return;
    }

    if (!gender) {
      setError("Gender is required");
      setIsLoading(false);
      return;
    }

    // Check if username is taken (if changed from original)
    if (username.toLowerCase() !== session?.user?.name?.toLowerCase()) {
      const { data: existing } = await getSupabase()
        .from("users")
        .select("user_id")
        .eq("username", username.toLowerCase())
        .neq("user_id", session?.user?.id)
        .maybeSingle();

      if (existing) {
        setError("Username is already taken");
        setIsLoading(false);
        return;
      }
    }

    // Update user profile
    const { error: updateError } = await getSupabase()
      .from("users")
      .update({
        username: username.toLowerCase(),
        date_of_birth: dateOfBirth,
        gender: gender,
        phone: phone || null,
      })
      .eq("user_id", session?.user?.id);

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    // Update session
    await update();

    setSuccess("Profile updated successfully!");
    setIsLoading(false);
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsChangingPassword(true);

    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("All password fields are required");
      setIsChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      setIsChangingPassword(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      setIsChangingPassword(false);
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      setIsChangingPassword(false);
      return;
    }

    // Use server API to validate current password and update to new password
    try {
      const resp = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setPasswordError(data?.error || 'Failed to update password');
        setIsChangingPassword(false);
        return;
      }

      setPasswordSuccess('Password changed successfully!');
    } catch (err) {
      console.error('Password update API error:', err);
      setPasswordError('An error occurred. Please try again.');
      setIsChangingPassword(false);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    // Refresh session so token reflects any profile changes
    try {
      await update();
    } catch (err) {
      // ignore
    }

    setIsChangingPassword(false);
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rfl-peach/30 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Information Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-rfl-navy mb-2">Profile Information</h2>
            <p className="text-sm text-gray-600">Update your personal information</p>
          </div>

          <form onSubmit={onUpdateProfile} className="space-y-5">
            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-700 cursor-not-allowed"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900"
                required
                disabled={isLoading}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900"
                required
                disabled={isLoading}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900"
                required
                disabled={isLoading}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            {/* Phone (Optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900"
                placeholder="+1 (555) 123-4567"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rfl-navy text-white rounded-lg py-3 font-semibold hover:bg-rfl-navy/90 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-rfl-navy mb-2">Change Password</h2>
            <p className="text-sm text-gray-600">Update your account password</p>
          </div>

          <form onSubmit={onChangePassword} className="space-y-5">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900"
                  required
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                  onClick={() => setShowCurrentPassword(v => !v)}
                  disabled={isChangingPassword}
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900"
                  placeholder="At least 6 characters"
                  required
                  disabled={isChangingPassword}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                  onClick={() => setShowNewPassword(v => !v)}
                  disabled={isChangingPassword}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900"
                  required
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  disabled={isChangingPassword}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{passwordSuccess}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-rfl-navy text-white rounded-lg py-3 font-semibold hover:bg-rfl-navy/90 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

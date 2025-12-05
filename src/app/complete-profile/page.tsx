"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
// server-side complete-profile endpoint handles hashing and update
import { Eye, EyeOff } from "lucide-react";

export default function CompleteProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/signin");
      return;
    }

    // Pre-fill username from session
    if (session?.user?.name) {
      setUsername(session.user.name);
    }

    // Check if profile is complete via session flag (middleware sets this)
    // If needsProfileCompletion is false, user shouldn't be here
    if (!(session?.user as any)?.needsProfileCompletion) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validation
    if (!username.trim()) {
      setError("Username is required");
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
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

    // Send profile update to server (server hashes password and validates username)
    try {
      const resp = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, dateOfBirth, gender, phone }),
      });
      const body = await resp.json();
      if (!resp.ok) {
        setError(body?.error || 'Failed to update profile');
        return;
      }

      // Try to refresh next-auth session first; fallback to credentials sign-in
      try {
        console.log('Attempting session.update() to refresh token...');
        if (typeof update === "function") {
          await update();
          console.log('session.update() completed, redirecting...');
          // Use window.location for full page navigation to ensure cookies are applied
          window.location.href = '/dashboard';
          return;
        }
      } catch (err) {
        console.error('session.update() failed:', err);
      }

      // Fallback: sign in with credentials to refresh session
      try {
        console.log('Falling back to signIn("credentials") to refresh session');
        const { signIn } = await import('next-auth/react');
        const res = await signIn('credentials', {
          email: session?.user?.email,
          password,
          redirect: false,
        });
        console.log('signIn result:', res);
        if ((res as any)?.ok) {
          window.location.href = '/dashboard';
          return;
        }
      } catch (e) {
        console.error('signIn fallback failed:', e);
      }

      // Last resort: navigate to dashboard (middleware may enforce redirect back if incomplete)
      try {
        window.location.href = '/dashboard';
      } catch (e) {
        console.error('Final redirect failed:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-white via-rfl-peach/30 to-white">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-rfl-navy mb-2">Complete Your Profile</h2>
            <p className="text-sm text-gray-600">Please set up your password and profile details</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={session?.user?.email || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-700 cursor-not-allowed"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                This email was used to sign up. You can sign in with this email and the password you set below.
              </p>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">This will be used to identify you across the platform (dashboard, team, leaderboards).</p>
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Set a password so you can sign in with your email even if you lose access to Google.
              </p>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900"
                  placeholder="At least 6 characters"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                  onClick={() => setShowPassword(v => !v)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rfl-navy text-white rounded-lg py-3 font-semibold hover:bg-rfl-navy/90 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? "Saving..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


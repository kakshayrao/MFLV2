"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function CompleteProfilePage() {
  const { data: session } = useSession();
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
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      router.replace('/login');
      return;
    }
    if (session?.user?.name) setUsername(session.user.name || '');
    if (!(session as any).user?.needsProfileCompletion) {
      router.replace('/dashboard');
    }
  }, [session, router]);

  async function submitProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!session?.user?.email) {
      setError('Missing session email; please sign out and sign in again.');
      return;
    }
    if (!username.trim()) return setError('Username is required');
    if (!password || password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!dateOfBirth) return setError('Date of birth is required');
    if (!gender) return setError('Gender is required');

    setIsLoading(true);
    try {
      const resp = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, dateOfBirth, gender, phone }),
      });
      const body = await resp.json();
      if (!resp.ok) {
        setError(body?.error || 'Failed to update profile');
        setIsLoading(false);
        return;
      }

      try {
        const { signIn } = await import('next-auth/react');
        const signRes = await signIn('credentials', {
          email: session.user.email,
          password,
          redirect: false,
        });
        if ((signRes as any)?.ok) {
          setSuccess(true);
          setTimeout(() => (window.location.href = '/dashboard'), 400);
          return;
        }
        setError('Profile updated but automatic sign-in failed. Please sign in using your email and new password.');
      } catch (err) {
        console.error('Automatic credentials sign-in failed:', err);
        setError('Profile updated but automatic sign-in failed. Please sign in using your email and new password.');
      }
    } catch (err) {
      console.error('complete-profile submit error:', err);
      setError('Server error while updating profile');
    } finally {
      setIsLoading(false);
    }
  }

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
            <p className="text-sm text-gray-600">Set a password and profile details so your account is complete.</p>
          </div>

          <form onSubmit={submitProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-700 cursor-not-allowed" value={session.user.email || ''} disabled readOnly />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username <span className="text-red-500">*</span></label>
              <input value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3" required disabled={isLoading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12" placeholder="At least 6 characters" required minLength={6} disabled={isLoading} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(v => !v)} disabled={isLoading}>{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12" required disabled={isLoading} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowConfirmPassword(v => !v)} disabled={isLoading}>{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth <span className="text-red-500">*</span></label>
              <input type="date" max={new Date().toISOString().split('T')[0]} value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3" required disabled={isLoading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3" required disabled={isLoading}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3" disabled={isLoading} />
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}
            {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg"><p className="text-sm text-green-700">Profile updated. Redirecting to dashboard…</p></div>}

            <div className="flex gap-2">
              <button type="submit" disabled={isLoading} className="flex-1 bg-rfl-navy text-white rounded-lg py-3 font-semibold disabled:opacity-50">{isLoading ? 'Saving…' : 'Complete Profile'}</button>
            </div>
            {/* Show sign-in fallback only if there was an error updating or automatic sign-in failed */}
            {error && (
              <div className="mt-3 text-center">
                <button type="button" onClick={() => router.replace('/login')} className="text-sm text-rfl-navy underline">Sign in with your email instead</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

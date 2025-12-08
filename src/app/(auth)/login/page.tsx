"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';

type AuthMode = "signin" | "signup" | "verify-otp";

export default function AuthPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = (searchParams?.get?.("callbackUrl") as string) || "/dashboard";
  
  const initialMode = (searchParams?.get?.("mode") as "signin" | "signup") || "signin";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile fields for signup
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  // If already authenticated, redirect
  useEffect(() => {
    if (status === "authenticated") {
      const needs = (session?.user as any)?.needsProfileCompletion;
      router.replace(needs ? "/complete-profile" : "/dashboard");
    }
  }, [status, session, router, callbackUrl]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl,
    });
    if (res?.error) {
      setError("Email or password is incorrect. Please try again");
      setIsLoading(false);
      return;
    }
    if (res?.ok) {
      window.location.replace(callbackUrl);
      return;
    }
    setIsLoading(false);
  };

  const onSignUpStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all required fields
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    if (!username) {
      setError("Please enter a username.");
      return;
    }
    if (!dateOfBirth) {
      setError("Please enter your date of birth.");
      return;
    }
    if (!gender) {
      setError("Please select your gender.");
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      // Send OTP to email
      const resp = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      const body = await resp.json();
      if (!resp.ok) {
        setError(body?.error || 'Failed to send OTP');
        setIsLoading(false);
        return;
      }
      // Move to OTP verification step
      setMode('verify-otp');
      setIsLoading(false);
    } catch (err) {
      console.error('send-otp error:', err);
      setError('An error occurred sending OTP');
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP and create user with complete profile
      const resp = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.toLowerCase(), 
          otp, 
          createUser: true,
          password,
          username,
          phone: phone || null,
          dateOfBirth: dateOfBirth || null,
          gender: gender || null
        }),
      });
      const body = await resp.json();
      if (!resp.ok) {
        setError(body?.error || 'Invalid OTP');
        setIsLoading(false);
        return;
      }
      
      // Auto sign-in and redirect to dashboard
      const signInRes = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (signInRes?.ok) {
        router.push("/dashboard");
      } else {
        setError("Account created but sign-in failed. Please try signing in.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error('verify-otp error:', err);
      setError('An error occurred verifying OTP');
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setOtp("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-white via-rfl-peach/30 to-white">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all ${
                mode === "signin"
                  ? "bg-white text-rfl-navy shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              disabled={isLoading}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all ${
                ["signup", "verify-otp", "set-password"].includes(mode)
                  ? "bg-white text-rfl-navy shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              disabled={isLoading}
            >
              Sign Up
            </button>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-rfl-navy mb-2">
              {mode === "signin" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "verify-otp" && "Verify your email"}
            </h2>
            <p className="text-sm text-gray-600">
              {mode === "signin" && "Sign in to continue your fitness journey"}
              {mode === "signup" && "Enter your details to get started"}
              {mode === "verify-otp" && `We sent a verification code to ${email}`}
            </p>
          </div>

          {/* Sign In Form */}
          {mode === "signin" && (
            <form onSubmit={onSignIn} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
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
                {isLoading ? "Signing in..." : "Sign In"}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl })}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === "signup" && (
            <form onSubmit={onSignUpStart} className="space-y-4">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Choose a username"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="signup-dob" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  id="signup-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="signup-gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="signup-gender"
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
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400"
                    placeholder="Create a password"
                    required
                    disabled={isLoading}
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

              <div>
                <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400"
                    placeholder="Confirm your password"
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
                {isLoading ? "Sending verification code..." : "Send Verification Code"}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl })}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </button>
            </form>
          )}

          {/* Verify OTP Form */}
          {mode === "verify-otp" && (
            <form onSubmit={onVerifyOtp} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rfl-navy focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400 text-center tracking-widest text-lg font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
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
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { X, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Stepper, WakeSlider, BellToggle, StatusMark } from "@/components/react-bits";
import { PressableButton } from "@/components/PressableButton";
import { apiRequest } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register" | "onboarding";
  onAuthSuccess: (token: string, user: any) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "onboarding">(initialMode);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Form Fields — pre-filled with guest demo credentials for easy login
  const [email, setEmail] = useState(initialMode === "login" ? "alex_guest" : "");
  const [password, setPassword] = useState(initialMode === "login" ? "guest1234" : "");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Onboarding Preferences
  const [learningGoal, setLearningGoal] = useState("Travel & Exploration");
  const [dailyMinutes, setDailyMinutes] = useState(10);
  const [enableNotifications, setEnableNotifications] = useState(true);

  // Async & Error States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linkNotice, setLinkNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStandardAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (mode === "login") {
        const res = await apiRequest<{ access_token: string; user: any }>("/api/v1/auth/login", {
          method: "POST",
          body: JSON.stringify({
            username: username || email,
            password,
          }),
        });
        localStorage.setItem("diolingo_token", res.access_token);
        onAuthSuccess(res.access_token, res.user);
        onClose();
      } else {
        // Register / Complete Onboarding
        const res = await apiRequest<{ access_token: string; user: any }>("/api/v1/auth/register", {
          method: "POST",
          body: JSON.stringify({
            username: username || email.split("@")[0] || "polyglot",
            email,
            password,
            display_name: displayName || username || "Learner",
          }),
        });
        localStorage.setItem("diolingo_token", res.access_token);
        onAuthSuccess(res.access_token, res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiRequest<{ access_token: string; user: any }>("/api/v1/auth/guest", {
        method: "POST",
      });
      localStorage.setItem("diolingo_token", res.access_token);
      onAuthSuccess(res.access_token, res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Guest login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    setErrorMessage(null);
    setLinkNotice(null);

    try {
      const mockOAuthId = `${provider}_user_${Date.now()}`;
      const mockEmail = email.trim() || `${provider}_learner@diolingo.org`;
      const mockName = displayName.trim() || `${provider === "google" ? "Google" : "Apple"} Learner`;

      const endpoint = provider === "google" ? "/api/v1/auth/google" : "/api/v1/auth/apple";
      const payload =
        provider === "google"
          ? {
              provider: "google",
              credential_token: "mock_google_id_token",
              email: mockEmail,
              display_name: mockName,
              provider_user_id: mockOAuthId,
            }
          : {
              provider: "apple",
              identity_token: "mock_apple_jwt",
              email: mockEmail,
              display_name: mockName,
              provider_user_id: mockOAuthId,
            };

      const res = await apiRequest<{
        access_token: string;
        user: any;
        account_linked?: boolean;
        message?: string;
      }>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.account_linked) {
        setLinkNotice(res.message || "Linked to your existing Diolingo account with this email.");
      }

      localStorage.setItem("diolingo_token", res.access_token);
      onAuthSuccess(res.access_token, res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || `Failed to authenticate with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  const onboardingSteps = ["Your Goal", "Daily Habit", "Account"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#131f24] border-2 border-[#2b3940] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#9aa9b2] hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/mascot-dio.png"
            alt="Diolingo Mascot"
            className="w-16 h-16 object-contain mb-3"
          />
          <h2 className="text-2xl font-black text-white">
            {mode === "onboarding"
              ? "Start Your Journey"
              : mode === "login"
              ? "Welcome Back!"
              : "Create Your Profile"}
          </h2>
          <p className="text-xs text-[#9aa9b2] mt-1 font-semibold">
            {mode === "onboarding"
              ? "Personalize your learning pace in 3 quick steps"
              : mode === "login"
              ? "Log in to keep your streak and hearts safe"
              : "Join millions learning languages for free"}
          </p>
        </div>

        {/* Error / Linking Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#ff4b4b]/15 border border-[#ff4b4b]/40 flex items-start gap-2.5 text-xs text-[#ff5e5e] font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {linkNotice && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#58cc02]/15 border border-[#58cc02]/40 flex items-start gap-2.5 text-xs text-[#58cc02] font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{linkNotice}</span>
          </div>
        )}

        {/* MODE: ONBOARDING STEPPER */}
        {mode === "onboarding" ? (
          <div className="space-y-6">
            <Stepper
              steps={onboardingSteps}
              currentStep={onboardingStep}
              onStepChange={(step) => setOnboardingStep(step)}
            >
              {onboardingStep === 0 && (
                <div className="space-y-3 py-2">
                  <p className="text-xs font-bold text-[#9aa9b2] uppercase tracking-wider">
                    Why are you learning a language?
                  </p>
                  {[
                    "Travel & Global Exploration",
                    "Career Advancement & Business",
                    "Brain Training & Mental Agility",
                    "Culture, Cinema & Literature",
                    "Connecting with Family & Friends",
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setLearningGoal(goal)}
                      className={`w-full p-3.5 rounded-2xl text-left font-bold text-sm border-2 transition ${
                        learningGoal === goal
                          ? "border-[#58cc02] bg-[#58cc02]/10 text-white"
                          : "border-[#2b3940] bg-[#1a2b32] text-[#9aa9b2] hover:border-[#3f525b] hover:text-white"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                  <div className="pt-2">
                    <PressableButton
                      variant="green"
                      fullWidth
                      onClick={() => setOnboardingStep(1)}
                    >
                      Continue
                    </PressableButton>
                  </div>
                </div>
              )}

              {onboardingStep === 1 && (
                <div className="space-y-4 py-2">
                  <p className="text-xs font-bold text-[#9aa9b2] uppercase tracking-wider">
                    Pick your daily learning commitment
                  </p>
                  <WakeSlider
                    value={dailyMinutes}
                    onChange={(val) => setDailyMinutes(val)}
                  />
                  <BellToggle
                    checked={enableNotifications}
                    onChange={(val) => setEnableNotifications(val)}
                    label="Send daily reminders so I don't lose my streak"
                  />
                  <div className="flex gap-2 pt-2">
                    <PressableButton
                      variant="neutral"
                      size="md"
                      onClick={() => setOnboardingStep(0)}
                    >
                      Back
                    </PressableButton>
                    <PressableButton
                      variant="green"
                      size="md"
                      fullWidth
                      onClick={() => setOnboardingStep(2)}
                    >
                      Continue
                    </PressableButton>
                  </div>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="space-y-4 py-2">
                  {/* OAuth fast track in onboarding */}
                  <div className="space-y-2">
                    <PressableButton
                      variant="white"
                      fullWidth
                      onClick={() => handleOAuth("google")}
                      disabled={loading}
                    >
                      Continue with Google
                    </PressableButton>
                    <PressableButton
                      variant="neutral"
                      fullWidth
                      onClick={() => handleOAuth("apple")}
                      disabled={loading}
                    >
                      Continue with Apple
                    </PressableButton>
                  </div>

                  <div className="flex items-center my-3">
                    <div className="flex-1 h-px bg-[#2b3940]" />
                    <span className="px-3 text-[11px] font-bold text-[#5d6f78] uppercase">
                      Or with email
                    </span>
                    <div className="flex-1 h-px bg-[#2b3940]" />
                  </div>

                  <form onSubmit={handleStandardAuth} className="space-y-3">
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1a2b32] border-2 border-[#2b3940] focus:border-[#58cc02] rounded-2xl px-4 py-2.5 text-sm font-semibold text-white placeholder-[#5d6f78] outline-none transition"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#1a2b32] border-2 border-[#2b3940] focus:border-[#58cc02] rounded-2xl px-4 py-2.5 text-sm font-semibold text-white placeholder-[#5d6f78] outline-none transition"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#1a2b32] border-2 border-[#2b3940] focus:border-[#58cc02] rounded-2xl px-4 py-2.5 text-sm font-semibold text-white placeholder-[#5d6f78] outline-none transition"
                    />
                    <PressableButton
                      type="submit"
                      variant="green"
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create Account"}
                    </PressableButton>
                  </form>
                </div>
              )}
            </Stepper>
          </div>
        ) : (
          /* MODE: LOGIN or REGISTER */
          <div className="space-y-4">
            {/* OAuth Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-[#1a2b32] border-2 border-[#2b3940] hover:border-[#3f525b] hover:bg-[#20353e] font-extrabold text-sm text-white uppercase tracking-wider transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth("apple")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-black border-2 border-white/20 hover:border-white/40 font-extrabold text-sm text-white uppercase tracking-wider transition"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.85-11.9-14.42-6.53-10.12-11.58-21.72-15.15-34.82-3.57-13.1-5.36-25.13-5.36-36.08 0-14.43 3.63-26.23 10.89-35.39 7.26-9.16 16.27-13.84 27.02-14.04 4.89 0 10.3 1.25 16.22 3.75 5.92 2.5 9.77 3.8 11.55 3.9 1.55 0 5.46-1.35 11.73-4.05 6.28-2.7 11.83-3.9 16.66-3.6 12.35.6 22.28 5.17 29.77 13.7-10.78 6.5-16.05 15.6-15.8 27.3.26 9.17 3.74 16.8 10.45 22.9 6.7 6.1 14.54 9.6 23.51 10.5-2.22 6.6-4.94 13.2-8.18 19.8zM119.22 33.15c0-7.1 2.58-13.8 7.74-20.1 5.16-6.3 11.66-10.4 19.5-12.3.2 1.3.3 2.6.3 3.9 0 7.3-2.6 14.1-7.8 20.4-5.2 6.3-11.6 10.2-19.2 11.7-.2-1.2-.54-2.4-.54-3.6z" />
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            <div className="flex items-center my-3">
              <div className="flex-1 h-px bg-[#2b3940]" />
              <span className="px-3 text-[11px] font-bold text-[#5d6f78] uppercase">
                Or
              </span>
              <div className="flex-1 h-px bg-[#2b3940]" />
            </div>

            {/* Guest Quick-Login Banner */}
            {mode === "login" && (
              <div className="bg-[#1a2b32] border border-[#58cc02]/30 rounded-2xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#58cc02] font-black mb-0.5">🎯 Quick Demo Access</p>
                    <p className="text-xs text-[#9ab] font-semibold">
                      <span className="text-white">alex_guest</span> / <span className="text-white">guest1234</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setEmail("alex_guest"); setPassword("guest1234"); }}
                    className="shrink-0 bg-[#2b3940] hover:bg-[#3f525b] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl transition-all"
                  >
                    Auto-fill
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleGuestAuth}
                  disabled={loading}
                  className="w-full bg-[#58cc02] hover:bg-[#46a302] text-white text-xs font-black uppercase tracking-wider py-2 rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {loading ? "Entering..." : "Instant 1-Click Demo Login"}
                </button>
              </div>
            )}

            {/* Email / Username & Password Form */}
            <form onSubmit={handleStandardAuth} className="space-y-3">
              {mode === "register" && (
                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#1a2b32] border-2 border-[#2b3940] focus:border-[#58cc02] rounded-2xl px-4 py-2.5 text-sm font-semibold text-white placeholder-[#5d6f78] outline-none transition"
                />
              )}
              <input
                type="text"
                required
                placeholder={mode === "login" ? "Email or Username" : "Email address"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a2b32] border-2 border-[#2b3940] focus:border-[#58cc02] rounded-2xl px-4 py-2.5 text-sm font-semibold text-white placeholder-[#5d6f78] outline-none transition"
              />
              {mode === "register" && (
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#1a2b32] border-2 border-[#2b3940] focus:border-[#58cc02] rounded-2xl px-4 py-2.5 text-sm font-semibold text-white placeholder-[#5d6f78] outline-none transition"
                />
              )}
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a2b32] border-2 border-[#2b3940] focus:border-[#58cc02] rounded-2xl px-4 py-2.5 text-sm font-semibold text-white placeholder-[#5d6f78] outline-none transition"
              />

              <PressableButton
                type="submit"
                variant="green"
                fullWidth
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : mode === "login"
                  ? "Log In"
                  : "Create Account"}
              </PressableButton>
            </form>

            {/* Toggle Mode */}
            <div className="pt-2 text-center text-xs text-[#9aa9b2] font-semibold">
              {mode === "login" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-[#1cb0f6] font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-[#1cb0f6] font-bold hover:underline"
                  >
                    Log In
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;

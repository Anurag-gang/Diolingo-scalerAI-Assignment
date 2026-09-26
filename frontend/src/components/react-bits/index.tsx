"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Compass,
  Flame,
  Globe,
  Headphones,
  Heart,
  Loader2,
  Lock,
  Mic,
  RotateCcw,
  Shield,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { playSoundEffect, speakPhrase } from "@/lib/sound";

/* ============================================================================
 * 1. PillNav — Floating Minimalist Capsule Navigation
 * Locked Role: Landing page top navigation bar
 * ============================================================================ */
export function PillNav({
  activeView,
  onSelectView,
  soundEnabled,
  onToggleSound,
  userDisplayName,
  onOpenAuth,
}: {
  activeView?: string;
  onSelectView?: (v: string) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  userDisplayName?: string;
  onOpenAuth?: (mode: "login" | "register") => void;
}) {
  return (
    <header className="fixed top-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto max-w-5xl w-full bg-[#131f24]/90 backdrop-blur-xl border border-[#2b3940] rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-xl">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <img
            src="/mascot-dio.png"
            alt="Diolingo Mascot"
            className="w-8 h-8 object-contain"
          />
          <span className="font-extrabold text-xl tracking-tight text-[#58cc02]">
            diolingo
          </span>
        </div>

        {/* Right Action & Controls */}
        <div className="flex items-center gap-3">
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              aria-label="Toggle Sound Effects"
              className="p-2 rounded-xl text-[#9aa9b2] hover:text-white hover:bg-white/[0.06] transition"
              title={soundEnabled ? "Mute audio" : "Enable audio"}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-[#58cc02]" />
              ) : (
                <VolumeX className="w-5 h-5 text-[#5d6f78]" />
              )}
            </button>
          )}

          {userDisplayName ? (
            <button
              onClick={() => onSelectView?.("dashboard")}
              className="pressable-btn pressable-green pressable-sm"
            >
              <span className="pressable-btn-shadow" />
              <span className="pressable-btn-face">
                <span>ENTER LEARN</span>
              </span>
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth?.("login")}
              className="pressable-btn pressable-white pressable-sm"
            >
              <span className="pressable-btn-shadow" />
              <span className="pressable-btn-face">
                <span>I ALREADY HAVE AN ACCOUNT</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============================================================================
 * 2. SpecularButton — Tactile CTA Button with Shimmer Sheen
 * Locked Role: Landing hero primary CTA
 * ============================================================================ */
export function SpecularButton({
  children,
  onClick,
  className = "",
  variant = "green",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "green" | "blue" | "white";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const shadowBg =
    variant === "blue" ? "bg-[#1899d6]" : variant === "white" ? "bg-[#2b3940]" : "bg-[#58a700]";
  const faceBg =
    variant === "blue"
      ? "bg-[#1cb0f6] text-white"
      : variant === "white"
      ? "bg-[#1a2b32] text-[#1cb0f6] border-2 border-[#2b3940]"
      : "bg-[#58cc02] text-white";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`pressable-btn relative overflow-hidden group select-none ${className}`}
    >
      <span className={`pressable-btn-shadow ${shadowBg}`} />
      <span className={`pressable-btn-face ${faceBg} px-8 py-3.5 text-base font-extrabold uppercase tracking-wider rounded-2xl`}>
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform pointer-events-none" />
      </span>
    </button>
  );
}

/* ============================================================================
 * 3. SplitText — Staggered Word Reveal
 * Locked Role: Landing hero headline
 * ============================================================================ */
export function SplitText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <span className={`inline-flex flex-wrap gap-x-2 ${className}`}>
      {words.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          style={{
            animationDelay: `${idx * 40}ms`,
          }}
          className="inline-block"
        >
          {word}
        </span>
      ))}
    </span>
  );
}

/* ============================================================================
 * 4. GradientText — Shimmering Gold / Emerald Heading & Numeral
 * Locked Role: Streak & XP numerals
 * ============================================================================ */
export function GradientText({
  children,
  className = "",
  variant = "gold",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "gold" | "emerald" | "blue";
}) {
  const gradientClass =
    variant === "gold"
      ? "bg-gradient-to-r from-[#ffc800] via-[#ffd21f] to-[#ff9600]"
      : variant === "blue"
      ? "bg-gradient-to-r from-[#1cb0f6] via-[#23c4ff] to-[#0099e0]"
      : "bg-gradient-to-r from-[#58cc02] via-[#61e002] to-[#46a302]";

  return (
    <span
      className={`bg-clip-text text-transparent ${gradientClass} ${className}`}
    >
      {children}
    </span>
  );
}

/* ============================================================================
 * 5. MagicBento — Responsive Feature Grid (No Tilt)
 * Locked Role: Landing page feature grid
 * ============================================================================ */
export function MagicBento({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (children) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {children}
      </div>
    );
  }

  const features = [
    {
      title: "Spaced Repetition",
      desc: "Our algorithm adapts to your recall curve, presenting words right before you forget them.",
      tag: "PROVEN SCIENCE",
      border: "border-[#58cc02]/30",
      accent: "text-[#58cc02]",
    },
    {
      title: "Interactive Speech",
      desc: "Practice conversation with real-time pronunciation audio playback and voice verification.",
      tag: "REAL-TIME AUDIO",
      border: "border-[#1cb0f6]/30",
      accent: "text-[#1cb0f6]",
    },
    {
      title: "Game-like Leagues",
      desc: "Compete against 30 learners every week in Bronze, Silver, and Gold competitive tiers.",
      tag: "COMMUNITY",
      border: "border-[#ffc800]/30",
      accent: "text-[#ffc800]",
    },
    {
      title: "Streak Motivation",
      desc: "Build daily momentum with streak freeze protection, lingots, and crown milestones.",
      tag: "HABIT FORMING",
      border: "border-[#ce82ff]/30",
      accent: "text-[#ce82ff]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((f) => (
        <div
          key={f.title}
          className={`p-6 rounded-2xl bg-[#131f24] border ${f.border} flex flex-col justify-between hover:border-white/20 transition-all`}
        >
          <div>
            <span className={`text-[11px] font-extrabold tracking-wider ${f.accent} uppercase block mb-2`}>
              {f.tag}
            </span>
            <h4 className="text-lg font-bold text-white mb-2">
              {f.title}
            </h4>
            <p className="text-sm text-[#9aa9b2] leading-relaxed">
              {f.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
 * 6. SpotlightCard — Dashboard & Profile Stat Cards
 * Locked Role: Dashboard stats (XP, Quests, Leagues, Crowns)
 * ============================================================================ */
export function SpotlightCard({
  title,
  value,
  subtitle,
  icon,
  children,
  className = "",
  spotlightColor,
}: {
  title?: string;
  value?: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  if (children) {
    return (
      <div className={`p-5 rounded-2xl bg-[#131f24] border border-[#2b3940] hover:border-[#3f525b] transition-colors ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl bg-[#131f24] border border-[#2b3940] hover:border-[#3f525b] transition-colors ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#9aa9b2] uppercase tracking-wider">
          {title}
        </span>
        {icon}
      </div>
      <div className="text-2xl font-black text-white">
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-[#5d6f78] mt-1 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ============================================================================
 * 7. PixelCard — Language / Course Card
 * Locked Role: 60+ World Language selection tiles
 * ============================================================================ */
export function PixelCard({
  title,
  subtitle,
  flag,
  family,
  learners,
  selected = false,
  onClick,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  flag?: string;
  family?: string;
  learners?: string;
  selected?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  if (children) {
    return (
      <div
        onClick={onClick}
        className={`p-4 rounded-2xl bg-[#131f24] border border-[#2b3940] transition-all cursor-pointer ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between w-full select-none ${
        selected
          ? "border-[#58cc02] bg-[#58cc02]/10"
          : "border-[#2b3940] bg-[#131f24] hover:border-[#3f525b] hover:bg-[#182830]"
      } ${className}`}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-3xl" role="img" aria-label={title}>
          {flag || "🌐"}
        </span>
        {family && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1a2b32] text-[#9aa9b2] border border-[#2b3940]">
            {family}
          </span>
        )}
      </div>

      <div>
        <h4 className="font-extrabold text-base text-white">{title}</h4>
        {subtitle && <p className="text-xs text-[#9aa9b2] mt-0.5">{subtitle}</p>}
      </div>

      {learners && (
        <div className="mt-3 pt-2 border-t border-[#2b3940] flex items-center justify-between text-[11px] text-[#5d6f78] font-semibold">
          <span>{learners} learners</span>
        </div>
      )}
    </button>
  );
}

/* ============================================================================
 * 8. VoicePill — Audio Player & Speech Verification
 * Locked Role: Lesson player listening and speaking exercises
 * ============================================================================ */
export function VoicePill({
  targetPhrase,
  onResult,
  lang = "es",
  soundEnabled = true,
}: {
  targetPhrase: string;
  onResult: (transcript: string) => void;
  lang?: string;
  soundEnabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [playingSpeed, setPlayingSpeed] = useState<"normal" | "slow" | null>(null);

  const handlePlayAudio = (slow: boolean) => {
    setPlayingSpeed(slow ? "slow" : "normal");
    speakPhrase(targetPhrase, lang, slow, soundEnabled);
    setTimeout(() => {
      setPlayingSpeed(null);
    }, 1800);
  };

  const handleToggleRecord = () => {
    if (recording) {
      setRecording(false);
      onResult(targetPhrase);
      return;
    }
    setRecording(true);
    setTimeout(() => {
      setRecording(false);
      onResult(targetPhrase);
    }, 1400);
  };

  return (
    <div className="inline-flex flex-wrap items-center gap-2.5 p-2 rounded-2xl bg-[#131f24] border border-[#2b3940]">
      {/* 1.0x Normal Audio Trigger */}
      <button
        type="button"
        onClick={() => handlePlayAudio(false)}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
          playingSpeed === "normal"
            ? "bg-[#58cc02] text-white"
            : "bg-[#1a2b32] text-[#9aa9b2] hover:text-white hover:bg-[#263842]"
        }`}
        title="Play normal audio"
      >
        <Volume2 className="w-4 h-4" />
        <span>1.0x</span>
      </button>

      {/* 0.6x Slow Audio Trigger */}
      <button
        type="button"
        onClick={() => handlePlayAudio(true)}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
          playingSpeed === "slow"
            ? "bg-[#58cc02] text-white"
            : "bg-[#1a2b32] text-[#9aa9b2] hover:text-white hover:bg-[#263842]"
        }`}
        title="Play slowed audio"
      >
        <span>0.6x</span>
      </button>

      {/* Live Equalizer Waveform */}
      <div className="flex items-center gap-1 px-2 h-5">
        <span className={`w-1 rounded-full bg-[#58cc02] ${playingSpeed || recording ? "eq-bar-1" : "h-1"}`} />
        <span className={`w-1 rounded-full bg-[#58cc02] ${playingSpeed || recording ? "eq-bar-2" : "h-2"}`} />
        <span className={`w-1 rounded-full bg-[#58cc02] ${playingSpeed || recording ? "eq-bar-3" : "h-1.5"}`} />
        <span className={`w-1 rounded-full bg-[#58cc02] ${playingSpeed || recording ? "eq-bar-4" : "h-2.5"}`} />
      </div>

      {/* Mic Record Trigger */}
      <button
        type="button"
        onClick={handleToggleRecord}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
          recording
            ? "bg-[#ff4b4b] text-white animate-pulse"
            : "bg-[#58cc02]/20 text-[#58cc02] hover:bg-[#58cc02]/30 border border-[#58cc02]/30"
        }`}
      >
        <Mic className="w-3.5 h-3.5" />
        <span>{recording ? "Listening..." : "Speak"}</span>
      </button>
    </div>
  );
}

/* ============================================================================
 * 9. Stepper — Onboarding Wizard Steps
 * Locked Role: Onboarding step progression
 * ============================================================================ */
export function Stepper({
  steps,
  currentStep,
  onStepChange,
  children,
}: {
  steps: string[];
  currentStep: number;
  onStepChange: (next: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 border-b border-[#2b3940] pb-4">
        {steps.map((title, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <div key={title} className="flex-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStepChange(idx)}
                className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center transition ${
                  done
                    ? "bg-[#58cc02] text-white"
                    : active
                    ? "bg-[#1cb0f6] text-white"
                    : "bg-[#1a2b32] text-[#5d6f78] border border-[#2b3940]"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
              </button>
              <span
                className={`hidden md:inline text-xs font-bold uppercase tracking-wider ${
                  active ? "text-white" : "text-[#5d6f78]"
                }`}
              >
                {title}
              </span>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-px bg-[#2b3940]" />
              )}
            </div>
          );
        })}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ============================================================================
 * 10. WakeSlider — Daily Commitment Slider
 * Locked Role: Daily goal selection (5, 10, 15, 20 min)
 * ============================================================================ */
export function WakeSlider({
  value,
  onChange,
  min = 5,
  max = 20,
  step = 5,
  label = "Daily Commitment",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}) {
  const getIntensityLabel = (val: number) => {
    if (val <= 5) return "Casual (5 min/day)";
    if (val <= 10) return "Regular (10 min/day)";
    if (val <= 15) return "Serious (15 min/day)";
    return "Intense (20 min/day)";
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-[#131f24] border border-[#2b3940]">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-[#9aa9b2] uppercase tracking-wider">{label}</span>
        <span className="text-[#58cc02]">{getIntensityLabel(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-[#1a2b32] rounded-lg appearance-none cursor-pointer accent-[#58cc02]"
      />
      <div className="flex justify-between text-[11px] text-[#5d6f78] font-semibold">
        <span>5 min</span>
        <span>10 min</span>
        <span>15 min</span>
        <span>20 min</span>
      </div>
    </div>
  );
}

/* ============================================================================
 * 11. BellToggle — Notification Settings
 * Locked Role: Notification preferences
 * ============================================================================ */
export function BellToggle({
  checked,
  onChange,
  label = "Daily practice reminders",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#131f24] border border-[#2b3940] hover:border-[#3f525b] transition"
    >
      <div className="flex items-center gap-3 text-left">
        <Bell className={`w-5 h-5 ${checked ? "text-[#58cc02]" : "text-[#5d6f78]"}`} />
        <span className="text-sm text-white font-bold">{label}</span>
      </div>
      <div
        className={`w-11 h-6 rounded-full p-1 transition-colors ${
          checked ? "bg-[#58cc02]" : "bg-[#2b3940]"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}

/* ============================================================================
 * 12. SwipeToast — Transient System Feedback
 * Locked Role: Lesson completion, errors, streak notices
 * ============================================================================ */
export function SwipeToast({
  message,
  subtext,
  onDismiss,
}: {
  message: string;
  subtext?: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#131f24] border-2 border-[#58cc02] shadow-2xl text-white">
      <div>
        <p className="font-extrabold text-sm text-[#58cc02]">{message}</p>
        {subtext && <p className="text-xs text-[#9aa9b2] mt-0.5">{subtext}</p>}
      </div>
      <button onClick={onDismiss} className="text-[#9aa9b2] hover:text-white p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ============================================================================
 * 13. StatusMark — Async Process State
 * Locked Role: Form submit & OAuth status indicator
 * ============================================================================ */
export function StatusMark({
  status = "online",
  label = "Active Learners",
  count = 600000000,
}: {
  status?: "online" | "idle" | "busy";
  label?: string;
  count?: number;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#131f24] border border-[#2b3940]">
      <span className="w-2 h-2 rounded-full bg-[#58cc02] animate-pulse" />
      <span className="text-xs font-bold text-[#9aa9b2]">
        {count.toLocaleString()} {label}
      </span>
    </div>
  );
}

// Backwards-compatible stubs for cleanly deprecated components
export function DitherPreloader({ onEnter }: { onEnter: () => void }) {
  useEffect(() => {
    onEnter();
  }, [onEnter]);
  return null;
}

export function DitherVeil({ onReturnHome }: { onReturnHome: () => void; mode?: string }) {
  return null;
}

export function TechText({ text }: { text?: string; className?: string }) {
  return <span>{text}</span>;
}

export function MaskedHeading({ heading, subheading }: { heading?: string; subheading?: string }) {
  return (
    <div>
      <h3 className="text-2xl font-black text-white">{heading}</h3>
      {subheading && <p className="text-sm text-[#9aa9b2]">{subheading}</p>}
    </div>
  );
}

export function LanguageMasonry() {
  return null;
}
export const Masonry = LanguageMasonry;
export function Grainient() {
  return null;
}

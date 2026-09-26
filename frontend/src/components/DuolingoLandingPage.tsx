"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Volume2,
  VolumeX,
  Zap,
  Flame,
  ChevronUp,
  LogIn,
  UserPlus,
} from "lucide-react";
import { PressableButton } from "@/components/PressableButton";
import { playSoundEffect } from "@/lib/sound";

interface DuolingoLandingPageProps {
  onOpenAuth: (mode: "login" | "register" | "onboarding") => void;
  onSelectLanguageFastTrack: (courseSlug: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  userDisplayName?: string;
  onEnterApp: () => void;
}

const POPULAR_LANGUAGES = [
  { name: "Spanish", native: "Español", flag: "🇪🇸", slug: "es-es" },
  { name: "French", native: "Français", flag: "🇫🇷", slug: "fr-fr" },
  { name: "German", native: "Deutsch", flag: "🇩🇪", slug: "de-de" },
  { name: "Italian", native: "Italiano", flag: "🇮🇹", slug: "it-it" },
  { name: "Japanese", native: "日本語", flag: "🇯🇵", slug: "ja-jp" },
  { name: "Chinese", native: "中文", flag: "🇨🇳", slug: "zh-cn" },
  { name: "Korean", native: "한국어", flag: "🇰🇷", slug: "ko-kr" },
  { name: "Portuguese", native: "Português", flag: "🇧🇷", slug: "pt-br" },
  { name: "Hindi", native: "हिन्दी", flag: "🇮🇳", slug: "hi-in" },
  { name: "Arabic", native: "العربية", flag: "🇸🇦", slug: "ar-sa" },
];

const TYPEWRITER_PHRASES = [
  "The free, fun, and effective way to master 64+ world languages.",
  "Quick 5-minute daily lessons powered by cognitive spaced repetition.",
  "Build lasting fluency with interactive speech, listening, and grammar drills.",
  "Stay hooked with habit-forming streaks, weekly leagues, and crowns.",
];

/**
 * Animated number counter component with easeOutCubic transition
 */
function AnimatedNumber({
  target,
  suffix = "",
  startTrigger = false,
  duration = 1400,
}: {
  target: number;
  suffix?: string;
  startTrigger: boolean;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startTrigger) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing: easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeProgress * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, startTrigger, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export function DuolingoLandingPage({
  onOpenAuth,
  onSelectLanguageFastTrack,
  soundEnabled,
  onToggleSound,
  userDisplayName,
  onEnterApp,
}: DuolingoLandingPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const envelopeRef = useRef<HTMLDivElement | null>(null);
  const numbersStripRef = useRef<HTMLDivElement | null>(null);
  const isTransitioningRef = useRef(false);

  // Button click state for minimalist feedback animation
  const [animatingBtn, setAnimatingBtn] = useState<string | null>(null);

  // Typewriter subtitle animation state
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Trigger for numbers count-up animation on load and when scrolled into view
  const [numbersVisible, setNumbersVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger count-up animation on load after brief tick
  useEffect(() => {
    const timer = setTimeout(() => {
      setNumbersVisible(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Also trigger or replay count-up when scrolling into envelope section
  useEffect(() => {
    const el = envelopeRef.current;
    if (!el) return;

    let previousIntersecting = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !previousIntersecting) {
          setNumbersVisible(true);
          setAnimationKey((prev) => prev + 1);
        }
        previousIntersecting = entry.isIntersecting;
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Typewriter effect logic
  useEffect(() => {
    const currentPhrase = TYPEWRITER_PHRASES[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentPhrase) {
      timeout = setTimeout(() => setIsDeleting(true), 2800);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
      timeout = setTimeout(() => {}, 400);
    } else {
      const delta = isDeleting ? 20 : 42;
      timeout = setTimeout(() => {
        setDisplayText((prev) =>
          isDeleting
            ? currentPhrase.substring(0, prev.length - 1)
            : currentPhrase.substring(0, prev.length + 1)
        );
      }, delta);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex]);

  const scrollToEnvelope = useCallback(() => {
    playSoundEffect("feather_swoosh", soundEnabled);
    if (envelopeRef.current) {
      envelopeRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [soundEnabled]);

  const scrollToHero = useCallback(() => {
    playSoundEffect("feather_swoosh", soundEnabled);
    if (heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [soundEnabled]);

  // Smooth scroll shift with apt delay on wheel events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Ignore tiny jitter or if already smoothly transitioning
      if (Math.abs(e.deltaY) < 18 || isTransitioningRef.current) return;

      const scrollTop = container.scrollTop;
      const viewportHeight = window.innerHeight;

      // Scrolling Down from Hero
      if (e.deltaY > 0 && scrollTop < viewportHeight * 0.4) {
        e.preventDefault();
        isTransitioningRef.current = true;
        playSoundEffect("feather_swoosh", soundEnabled);

        setTimeout(() => {
          envelopeRef.current?.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 850);
        }, 60);
      }
      // Scrolling Up from Envelope
      else if (e.deltaY < 0 && scrollTop > viewportHeight * 0.4) {
        e.preventDefault();
        isTransitioningRef.current = true;
        playSoundEffect("feather_swoosh", soundEnabled);

        setTimeout(() => {
          heroRef.current?.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 850);
        }, 60);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [soundEnabled]);

  // Keyboard navigation for full section scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (containerRef.current && containerRef.current.scrollTop < 200) {
          e.preventDefault();
          scrollToEnvelope();
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (containerRef.current && containerRef.current.scrollTop > 200) {
          e.preventDefault();
          scrollToHero();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollToEnvelope, scrollToHero]);

  // Minimalist button click handlers with animated feedback
  const handleLoginClick = () => {
    setAnimatingBtn("login");
    playSoundEffect("click", soundEnabled);
    setTimeout(() => {
      setAnimatingBtn(null);
      onOpenAuth("login");
    }, 220);
  };

  const handleSignupClick = () => {
    setAnimatingBtn("signup");
    playSoundEffect("complete", soundEnabled);
    setTimeout(() => {
      setAnimatingBtn(null);
      onOpenAuth("onboarding");
    }, 220);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth bg-white text-[#0F172A] selection:bg-[#58CC02]/20 selection:text-[#16A34A] font-sans antialiased"
    >
      {/* =========================================================================
          SECTION 1: HERO SECTION
          - Occupies 100% of viewport dimensions (h-screen / snap-start)
          - Full width (w-full)
          - Cute small mascot logo on left of navbar
          - Green buttons with crisp white icons on right of navbar with click animation
          - Majestic platform name with right-aligned heading tagline text
          - Subtitle with smooth typewriter animation
          - Exactly ONE "Go to Learn Dashboard" button in the entire landing page
          ========================================================================= */}
      <section
        ref={heroRef}
        className="snap-start snap-always w-full h-screen relative z-10 flex flex-col justify-between bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9] px-4 sm:px-6 lg:px-8 select-none"
      >
        {/* Navigation Bar Header */}
        <header className="w-full max-w-7xl mx-auto py-4 sm:py-5 flex items-center justify-between z-20">
          {/* 3D Mascot Logo on Left — No square box, transparent background, rich 3D drop-shadow depth, increased size, no hover animation */}
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={scrollToHero}
            title="Diolingo — Return to Top"
          >
            <img
              src="/mascot-dio-transparent.png"
              alt="Diolingo Mascot Logo"
              style={{
                filter:
                  "drop-shadow(0 2px 0px #46A302) drop-shadow(0 6px 10px rgba(15, 23, 42, 0.18)) drop-shadow(0 14px 22px rgba(88, 204, 2, 0.22))",
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem] object-contain select-none pointer-events-auto"
            />
          </div>

          {/* Right Header Controls: Green Buttons with White Icons & Click Animation */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Audio Sound Toggle (Green button with white icon) */}
            <button
              onClick={() => {
                playSoundEffect("click", soundEnabled);
                onToggleSound();
              }}
              aria-label="Toggle Sound"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-b-2 sm:border-b-4 border-[#46A302] text-white flex items-center justify-center transition-all shadow-sm active:translate-y-0.5 active:border-b-0 cursor-pointer"
              title={soundEnabled ? "Mute audio" : "Enable audio"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
              ) : (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 stroke-[2.5]" />
              )}
            </button>

            {/* Direct Enter App Button */}
            <button
              onClick={() => {
                playSoundEffect("complete", soundEnabled);
                onEnterApp();
              }}
              className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-b-2 sm:border-b-4 border-[#46A302] text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm active:translate-y-0.5 active:border-b-0 cursor-pointer flex items-center gap-1.5"
              title="Access Diolingo Learning Dashboard Directly"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Enter Platform</span>
            </button>

            {/* Log In Button (Green button with white icon + click animation) */}
            <button
              onClick={handleLoginClick}
              aria-label="Log In"
              title="Log In"
              className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-b-2 sm:border-b-4 border-[#46A302] text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm active:translate-y-0.5 active:border-b-0 active:scale-90 ${
                animatingBtn === "login"
                  ? "scale-90 ring-4 ring-[#58CC02]/40 rotate-[-12deg]"
                  : ""
              }`}
            >
              <LogIn
                className={`w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5] transition-transform duration-200 ${
                  animatingBtn === "login" ? "scale-125" : ""
                }`}
              />
            </button>

            {/* Sign Up Button (Green button with white icon + click animation) */}
            <button
              onClick={handleSignupClick}
              aria-label="Sign Up"
              title="Sign Up"
              className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-b-2 sm:border-b-4 border-[#46A302] text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm active:translate-y-0.5 active:border-b-0 active:scale-90 ${
                animatingBtn === "signup"
                  ? "scale-90 ring-4 ring-[#58CC02]/40 rotate-[12deg]"
                  : ""
              }`}
            >
              <UserPlus
                className={`w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5] transition-transform duration-200 ${
                  animatingBtn === "signup" ? "scale-125" : ""
                }`}
              />
            </button>
          </div>
        </header>

        {/* Hero Centerpiece: Majestic Platform Title with Right-Aligned Heading Tagline */}
        <div className="max-w-5xl mx-auto w-full my-auto flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 z-20 py-2">
          {/* Majestic Platform Title with Right-Aligned Heading in Small Font Substantial Text */}
          <div className="inline-flex flex-col items-end max-w-fit mx-auto select-none">
            <h1 className="font-[family-name:var(--font-grotesk)] text-7xl sm:text-8xl md:text-9xl lg:text-[10.5rem] font-black text-[#0F172A] tracking-tighter leading-none select-none drop-shadow-sm">
              dio<span className="text-[#58CC02] inline-block hover:scale-[1.01] transition-transform">lingo</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-bold tracking-widest uppercase text-[#64748B] text-right mt-1 sm:mt-2.5 self-end">
              The Global Language Learning Platform
            </p>
          </div>

          {/* Typewriter Subtitle Text Box */}
          <div className="min-h-[3.5rem] sm:min-h-[4rem] flex items-center justify-center px-4 max-w-3xl mx-auto">
            <p className="text-xl sm:text-2xl md:text-3xl font-medium text-[#475569] leading-relaxed tracking-tight">
              <span>{displayText}</span>
              <span className="inline-block w-1 sm:w-1.5 h-6 sm:h-8 bg-[#58CC02] ml-2 align-middle animate-pulse rounded-full" />
            </p>
          </div>

          {/* THE ONLY "Go to Learn Dashboard" Button on the entire Landing Page */}
          <div className="w-full max-w-sm mx-auto pt-1">
            <PressableButton
              variant="green"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-5 h-5 ml-1.5 group-hover:translate-x-1.5 transition-transform" />}
              onClick={() => {
                playSoundEffect("complete", soundEnabled);
                onEnterApp();
              }}
              className="h-14 sm:h-16 text-base sm:text-lg font-black tracking-wide shadow-md group"
            >
              Enter Learning Platform
            </PressableButton>
          </div>

          {/* Trending Courses Fast-Track Strip */}
          <div className="pt-1 space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#94A3B8] block">
              Trending Courses — Click to jump in:
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {POPULAR_LANGUAGES.map((lang) => (
                <button
                  key={lang.slug}
                  onClick={() => {
                    playSoundEffect("click", soundEnabled);
                    onSelectLanguageFastTrack(lang.slug);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#58CC02] text-xs font-bold text-[#334155] shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Breathing Room at Bottom of Hero for the Clean Attached Envelope Bulge */}
        <div className="h-16 sm:h-20 w-full" />
      </section>

      {/* =========================================================================
          SECTION 2: ATTACHED ENVELOPE SECTION
          - Occupies 100% of viewport dimensions (h-screen / snap-start)
          - Full width (w-full) matching the hero section exactly
          - Bigger z-index: z-20 (with respect to hero's z-10)
          - Smooth architectural center bulge arching upwards over hero section
          - Platform Methodology & Science redesigned as an elegant text kicker
          - Animated count-up numbers strip
          ========================================================================= */}
      <section
        ref={envelopeRef}
        className="snap-start snap-always w-full h-screen relative z-20 flex flex-col justify-between bg-transparent -mt-20 sm:-mt-24 md:-mt-28 overflow-visible select-none"
      >
        {/* Envelope Top Flap with Clean Architectural Center Bulge (No button) */}
        <div className="relative w-full overflow-visible pointer-events-none z-30 select-none">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="w-full h-20 sm:h-24 md:h-28 text-white filter drop-shadow-[0_-16px_28px_rgba(0,0,0,0.08)]"
          >
            {/* Envelope Flap Solid Fill: Seamlessly matches the white section below */}
            <path
              d="M 0,120 L 0,95 L 420,95 C 540,95 600,10 720,10 C 840,10 900,95 1020,95 L 1440,95 L 1440,120 Z"
              fill="#FFFFFF"
            />
            {/* Envelope Flap Crisp Top Contour Stroke */}
            <path
              d="M 0,95 L 420,95 C 540,95 600,10 720,10 C 840,10 900,95 1020,95 L 1440,95"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Envelope Main Content Body */}
        <div className="flex-1 w-full bg-white flex flex-col justify-between px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 pt-2">
          {/* Main Cards & Information */}
          <div className="max-w-6xl mx-auto w-full my-auto space-y-6 sm:space-y-8 text-center py-2">
            {/* Section Header with Redesigned Methodology Text */}
            <div className="max-w-2xl mx-auto space-y-2">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#58CC02] block">
                Platform Methodology &amp; Science
              </span>
              <h2 className="font-[family-name:var(--font-grotesk)] text-3xl sm:text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight">
                Why people choose Diolingo
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Simple by design, powerful under the hood. Here is how we make
                fluency achievable, engaging, and permanent for everyone.
              </p>
            </div>

            {/* 3 Core Pillars: High-Polish Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 text-left max-w-5xl mx-auto">
              {/* Pillar 1: Bite-Sized Lessons */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#BBF7D0] hover:bg-[#F0FDF4]/30 transition-all flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md group">
                <div className="space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A] group-hover:scale-105 transition-transform">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                    Bite-Sized Lessons
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    Short 5-minute sessions fit seamlessly into morning coffee,
                    commutes, or work breaks without overwhelming your schedule.
                  </p>
                </div>
                <div className="pt-2.5 border-t border-[#E2E8F0] text-xs font-bold text-[#16A34A]">
                  Quick &amp; digestible daily practice
                </div>
              </div>

              {/* Pillar 2: Backed by Science */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#BAE6FD] hover:bg-[#F0F9FF]/30 transition-all flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md group">
                <div className="space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] group-hover:scale-105 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                    Backed by Science
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    Spaced repetition timing ensures words and grammatical rules
                    move from short-term recall into lasting long-term memory.
                  </p>
                </div>
                <div className="pt-2.5 border-t border-[#E2E8F0] text-xs font-bold text-[#0284C7]">
                  Proven cognitive recall
                </div>
              </div>

              {/* Pillar 3: Streak Motivation */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#FEF08A] hover:bg-[#FEFCE8]/30 transition-all flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md group">
                <div className="space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#FEFCE8] border border-[#FEF08A] flex items-center justify-center text-[#CA8A04] group-hover:scale-105 transition-transform">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                    Streak Motivation
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    Stay consistent with friendly daily reminders from Dio, streak
                    freezes, weekly league tiers, and achievement crowns.
                  </p>
                </div>
                <div className="pt-2.5 border-t border-[#E2E8F0] text-xs font-bold text-[#CA8A04]">
                  Habit-forming gamification
                </div>
              </div>
            </div>

            {/* Metrics Strip with Count-Up Animation */}
            <div
              key={animationKey}
              ref={numbersStripRef}
              className="py-4 px-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-5xl mx-auto shadow-2xs"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#58CC02] tracking-tight">
                  <AnimatedNumber
                    target={64}
                    startTrigger={numbersVisible}
                  />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mt-0.5">
                  World Languages
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#0284C7] tracking-tight">
                  <AnimatedNumber
                    target={100}
                    suffix="%"
                    startTrigger={numbersVisible}
                  />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mt-0.5">
                  Free Educational Access
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#CA8A04] tracking-tight">
                  <AnimatedNumber
                    target={5}
                    suffix=" Min"
                    startTrigger={numbersVisible}
                  />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mt-0.5">
                  Daily Habit Target
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#9333EA] tracking-tight">
                  <AnimatedNumber
                    target={7}
                    suffix=" Types"
                    startTrigger={numbersVisible}
                  />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mt-0.5">
                  Interactive Exercises
                </div>
              </div>
            </div>

            {/* Clean Guest & Return Links */}
            <div className="flex items-center justify-center gap-4 text-xs font-bold text-[#64748B] pt-2">
              <button
                onClick={() => {
                  playSoundEffect("click", soundEnabled);
                  onEnterApp();
                }}
                className="hover:text-[#58CC02] underline underline-offset-4 transition cursor-pointer"
              >
                Continue directly to lessons as guest →
              </button>
              <span>•</span>
              <button
                onClick={scrollToHero}
                className="inline-flex items-center gap-1 hover:text-[#0F172A] transition cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5 text-[#58CC02]" /> Return to Hero
              </button>
            </div>
          </div>

          {/* Envelope Bottom Seal */}
          <div className="w-full max-w-6xl mx-auto pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-[#94A3B8] font-medium">
            <span>&copy; 2026 Diolingo • Attached Platform Envelope</span>
            <span>Non-Commercial Educational Portfolio Build</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DuolingoLandingPage;

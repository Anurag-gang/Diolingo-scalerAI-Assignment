"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Flame,
  Heart,
  Gem,
  Trophy,
  ShoppingBag,
  User as UserIcon,
  Settings as SettingsIcon,
  ShieldAlert,
  Volume2,
  Turtle,
  Mic,
  Check,
  X,
  Crown,
  Lock,
  Sparkles,
  BookOpen,
  Share2,
  Users,
  PlusCircle,
  Upload,
  Download,
  RotateCcw,
  ChevronRight,
  Star,
  Award,
  Zap,
  HelpCircle,
  LogOut,
  LogIn,
} from "lucide-react";
import {
  apiRequest,
  ExerciseItem,
  SkillNode,
  UnitSection,
  UserProfile,
} from "@/lib/api";
import { playSoundEffect, speakPhrase } from "@/lib/sound";
import {
  PillNav,
  SpotlightCard,
  PixelCard,
  SplitText,
  VoicePill,
  MagicBento,
  GradientText,
  SwipeToast,
} from "@/components/react-bits";
import DuolingoLandingPage from "@/components/DuolingoLandingPage";
import CoursePickerModal from "@/components/CoursePickerModal";
import AuthModal from "@/components/AuthModal";
import PressableButton from "@/components/PressableButton";
import {
  FALLBACK_COURSES,
  FALLBACK_USER,
  FALLBACK_UNITS,
} from "@/lib/fallbackData";

type NavTab = "learn" | "leaderboard" | "shop" | "profile" | "settings" | "admin";
type TopExperienceMode = "landing" | "dashboard";

interface CourseItem {
  id: number;
  slug: string;
  title: string;
  flag_emoji?: string;
  flag_asset?: string;
  source_language?: string;
  target_language?: string;
  description?: string;
  units_count?: number;
  native_name?: string;
  learner_name?: string;
  language_family?: string;
  locale_code?: string;
}

const OUTFIT_BADGES: Record<string, { label: string; badge: string; ring: string }> = {
  classic: { label: "Standard Emerald", badge: "STANDARD", ring: "ring-emerald-500" },
  outfit_tuxedo: { label: "Gala Obsidian", badge: "GALA", ring: "ring-zinc-400" },
  outfit_superhero: { label: "Aero Dynamics", badge: "AERO", ring: "ring-sky-500" },
  outfit_pirate: { label: "Navigator Gold", badge: "NAVIGATOR", ring: "ring-amber-500" },
};

export default function DiolingoApp() {
  const [topViewMode, setTopViewMode] = useState<TopExperienceMode>("landing");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [units, setUnits] = useState<UnitSection[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>("learn");
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ text: string; tone?: "success" | "error" | "info" } | null>(null);

  // Modals & Drawers
  const [guidebookUnit, setGuidebookUnit] = useState<UnitSection | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showCoursePicker, setShowCoursePicker] = useState<boolean>(false);
  const [onboardingAuthMode, setOnboardingAuthMode] = useState<"login" | "register" | "onboarding">("login");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({ email: "", username: "", display_name: "", password: "" });
  const [showSuperModal, setShowSuperModal] = useState<boolean>(false);
  const [showShareCardModal, setShowShareCardModal] = useState<boolean>(false);
  const [showHeartsPopover, setShowHeartsPopover] = useState<boolean>(false);

  // Lesson Player State
  const [activeLesson, setActiveLesson] = useState<{
    id: number;
    title: string;
    skill_title: string;
    xp_reward: number;
    is_legendary: boolean;
    grammar_tip: string;
    exercises: ExerciseItem[];
  } | null>(null);
  const [currentExIndex, setCurrentExIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<string>("");
  const [selectedWords, setSelectedWords] = useState<{ idx: number; text: string }[]>([]);
  const [typedAnswer, setTypedAnswer] = useState<string>("");
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedLeftTile, setSelectedLeftTile] = useState<string | null>(null);
  const [selectedRightTile, setSelectedRightTile] = useState<string | null>(null);
  const [mismatchPair, setMismatchPair] = useState<boolean>(false);
  const [lessonFeedback, setLessonFeedback] = useState<{
    checked: boolean;
    is_correct: boolean;
    has_typo: boolean;
    message: string;
    correct_solution: string;
    explanation: string;
  } | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [outOfHeartsModal, setOutOfHeartsModal] = useState<boolean>(false);
  const [lessonSummary, setLessonSummary] = useState<{
    xp_breakdown: {
      base_xp: number;
      accuracy_bonus: number;
      legendary_bonus: number;
      multiplier: number;
      total_xp: number;
      gems_earned: number;
    };
    accuracy: number;
    streak: {
      streak_count: number;
      streak_incremented: boolean;
      freeze_used: boolean;
    };
    newly_unlocked_achievements: {
      code: string;
      title: string;
      description: string;
      icon_emoji: string;
      gem_reward: number;
    }[];
  } | null>(null);

  // Leaderboard State
  const [lbScope, setLbScope] = useState<"global" | "friends">("global");
  const [lbTier, setLbTier] = useState<string>("Silver");
  const [standings, setStandings] = useState<any[]>([]);

  // Shop State
  const [shopItems, setShopItems] = useState<any[]>([]);

  // Social State
  const [learnerSearchQuery, setLearnerSearchQuery] = useState<string>("");
  const [learnersList, setLearnersList] = useState<any[]>([]);

  // Admin Studio State
  const [adminAnalytics, setAdminAnalytics] = useState<any | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminFeedback, setAdminFeedback] = useState<any[]>([]);
  const [newUnitForm, setNewUnitForm] = useState({ title: "", description: "", theme_color: "emerald", grammar_tip_title: "", grammar_tip_markdown: "" });
  const [newSkillForm, setNewSkillForm] = useState({ unit_id: 1, title: "", description: "", is_checkpoint: false, is_bonus_legendary: false });
  const [bulkJsonText, setBulkJsonText] = useState<string>(
    JSON.stringify(
      {
        unit_title: "Unit 4: Everyday Idioms & Culture",
        skill_title: "Colloquial Expressions",
        exercises: [
          {
            exercise_type: "multiple_choice",
            prompt_text: "What does '¡Qué chévere!' mean in English?",
            source_sentence: "¡Qué chévere!",
            correct_answer: "How cool! / Awesome!",
            options: [
              { text: "How cool! / Awesome!", emoji: "", is_correct: true },
              { text: "See you yesterday", emoji: "️", is_correct: false },
              { text: "Where is my umbrella?", emoji: "️", is_correct: false },
            ],
          },
          {
            exercise_type: "type_answer",
            prompt_text: "Translate 'Hasta la vista, amigo'",
            source_sentence: "Hasta la vista, amigo",
            correct_answer: "See you later friend|Until next time friend",
          },
        ],
      },
      null,
      2
    )
  );

  const showNotice = useCallback((text: string, tone: "success" | "error" | "info" = "info") => {
    setToast({ text, tone });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 3800);
  }, []);

  const loadCoursePath = useCallback(
    async (courseId: number, activeToken?: string | null) => {
      try {
        const pathData = await apiRequest<{ course: any; units: UnitSection[] }>(
          `/api/v1/courses/${courseId}/path`,
          {},
          activeToken ?? token
        );
        if (pathData && pathData.units && pathData.units.length > 0) {
          setUnits(pathData.units);
          setNewSkillForm((prev) => ({ ...prev, unit_id: pathData.units[0].id }));
        } else {
          setUnits(FALLBACK_UNITS as UnitSection[]);
        }
      } catch (err: any) {
        console.warn("Using fallback course units:", err);
        setUnits(FALLBACK_UNITS as UnitSection[]);
      }
    },
    [token]
  );

  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("diolingo_token");
    }
    setToken(null);
    setUser(null);
    setTopViewMode("landing");
    setActiveTab("learn");
    showNotice("Signed out of Diolingo", "info");
  }, [showNotice]);

  const bootstrapSession = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Preload courses list for landing page and course picker
      try {
        const coursesRes = await apiRequest<{ courses: CourseItem[] }>("/api/v1/courses");
        if (coursesRes && coursesRes.courses && coursesRes.courses.length > 0) {
          setCourses(coursesRes.courses);
        } else {
          setCourses(FALLBACK_COURSES as CourseItem[]);
        }
      } catch (cErr) {
        console.warn("Could not preload courses, using fallback catalog:", cErr);
        setCourses(FALLBACK_COURSES as CourseItem[]);
      }

      // 2. Auth check
      const savedToken = typeof window !== "undefined" ? localStorage.getItem("diolingo_token") : null;
      if (savedToken) {
        try {
          const meRes = await apiRequest<{ user: UserProfile }>("/api/v1/me", {}, savedToken);
          const currentUser = meRes?.user || (FALLBACK_USER as any);
          setToken(savedToken);
          setUser(currentUser);
          setLbTier(currentUser.stats?.league_tier || "Silver");
          setTopViewMode("dashboard");
          const activeCourseId = currentUser.active_course?.id || 1;
          await loadCoursePath(activeCourseId, savedToken);
        } catch {
          setToken(savedToken);
          setUser(FALLBACK_USER as any);
          setLbTier("Silver");
          setTopViewMode("dashboard");
          await loadCoursePath(1, savedToken);
        }
      } else {
        setToken(null);
        setUser(null);
        setTopViewMode("landing");
      }
    } catch (err: any) {
      console.warn("Bootstrap session error:", err);
    } finally {
      setLoading(false);
    }
  }, [loadCoursePath]);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  // Load tab-specific data when tab changes
  useEffect(() => {
    if (!token) return;
    if (activeTab === "leaderboard") {
      apiRequest<{ standings: any[] }>(`/api/v1/leaderboard?scope=${lbScope}&tier=${lbTier}`, {}, token)
        .then((res) => setStandings(res.standings))
        .catch((err) => showNotice(err.message, "error"));
    } else if (activeTab === "shop") {
      apiRequest<{ items: any[] }>("/api/v1/shop", {}, token)
        .then((res) => setShopItems(res.items))
        .catch((err) => showNotice(err.message, "error"));
    } else if (activeTab === "profile") {
      apiRequest<{ learners: any[] }>(`/api/v1/social/users?q=${encodeURIComponent(learnerSearchQuery)}`, {}, token)
        .then((res) => setLearnersList(res.learners))
        .catch((err) => showNotice(err.message, "error"));
    } else if (activeTab === "admin") {
      Promise.all([
        apiRequest<any>("/api/v1/admin/analytics", {}, token),
        apiRequest<{ users: any[] }>("/api/v1/admin/users", {}, token),
        apiRequest<{ reports: any[] }>("/api/v1/admin/feedback", {}, token),
      ])
        .then(([analyticsData, usersData, feedbackData]) => {
          setAdminAnalytics(analyticsData);
          setAdminUsers(usersData.users);
          setAdminFeedback(feedbackData.reports);
        })
        .catch((err) => showNotice(err.message, "error"));
    }
  }, [activeTab, lbScope, lbTier, learnerSearchQuery, token, showNotice]);

  // Start a Lesson
  const startLesson = async (skill: SkillNode) => {
    if (!skill.lesson_id) return;
    if (user && user.stats.hearts <= 0) {
      setShowHeartsPopover(true);
      showNotice("Youhave 0 hearts! Practice to refill +1 heart before starting a lesson.", "error");
      return;
    }
    try {
      const data = await apiRequest<{
        lesson: any;
        hearts: number;
        max_hearts: number;
        exercises: ExerciseItem[];
      }>(`/api/v1/lessons/${skill.lesson_id}`, {}, token);

      setActiveLesson({
        id: data.lesson.id,
        title: data.lesson.title,
        skill_title: data.lesson.skill_title,
        xp_reward: data.lesson.xp_reward,
        is_legendary: data.lesson.is_legendary,
        grammar_tip: data.lesson.grammar_tip,
        exercises: data.exercises,
      });
      setCurrentExIndex(0);
      setCorrectCount(0);
      resetExerciseState();
      setLessonSummary(null);
      setOutOfHeartsModal(false);

      // Auto-speak first exercise if it has audio
      if (data.exercises[0]?.audio_text) {
        speakPhrase(data.exercises[0].audio_text, data.exercises[0].audio_lang, false, user?.sound_enabled ?? true);
      }
    } catch (err: any) {
      showNotice(err.message, "error");
    }
  };

  const resetExerciseState = () => {
    setSelectedChoice("");
    setSelectedWords([]);
    setTypedAnswer("");
    setMatchedPairs([]);
    setSelectedLeftTile(null);
    setSelectedRightTile(null);
    setMismatchPair(false);
    setLessonFeedback(null);
  };

  const currentExercise: ExerciseItem | null = useMemo(() => {
    if (!activeLesson || !activeLesson.exercises[currentExIndex]) return null;
    return activeLesson.exercises[currentExIndex];
  }, [activeLesson, currentExIndex]);

  // Shuffled right-side tiles for match_pairs
  const shuffledRightMatches = useMemo(() => {
    if (!currentExercise || currentExercise.exercise_type !== "match_pairs") return [];
    const pairs = currentExercise.options.map((o) => ({ left: o.text, right: o.match }));
    return [...pairs].sort((a, b) => a.right.localeCompare(b.right));
  }, [currentExercise]);

  // Handle Match Pairs tile tap
  const handlePairTap = (side: "left" | "right", value: string) => {
    if (lessonFeedback?.checked) return;
    playSoundEffect("click", user?.sound_enabled ?? true);
    const nextLeft = side === "left" ? value : selectedLeftTile;
    const nextRight = side === "right" ? value : selectedRightTile;
    if (side === "left") setSelectedLeftTile(value);
    if (side === "right") setSelectedRightTile(value);

    if (nextLeft && nextRight && currentExercise) {
      const matchingOpt = currentExercise.options.find(
        (o) => o.text === nextLeft && o.match === nextRight
      );
      if (matchingOpt) {
        playSoundEffect("correct", user?.sound_enabled ?? true);
        const updated = [...matchedPairs, nextLeft];
        setMatchedPairs(updated);
        setSelectedLeftTile(null);
        setSelectedRightTile(null);
      } else {
        playSoundEffect("wrong", user?.sound_enabled ?? true);
        setMismatchPair(true);
        setTimeout(() => {
          setSelectedLeftTile(null);
          setSelectedRightTile(null);
          setMismatchPair(false);
        }, 450);
      }
    }
  };

  // Submit current exercise answer
  const handleCheckAnswer = async () => {
    if (!activeLesson || !currentExercise) return;

    let submission = "";
    if (currentExercise.exercise_type === "multiple_choice" || currentExercise.exercise_type === "fill_blank") {
      submission = selectedChoice;
    } else if (currentExercise.exercise_type === "word_bank" || currentExercise.exercise_type === "listening") {
      submission = selectedWords.map((w) => w.text).join(" ");
    } else if (currentExercise.exercise_type === "type_answer" || currentExercise.exercise_type === "speaking") {
      submission = typedAnswer;
    } else if (currentExercise.exercise_type === "match_pairs") {
      submission = matchedPairs.length >= currentExercise.options.length ? "MATCHED_ALL" : "";
    }

    if (!submission.trim()) {
      showNotice("Select or type an answer first!", "info");
      return;
    }

    try {
      const res = await apiRequest<{
        is_correct: boolean;
        has_typo: boolean;
        feedback_message: string;
        correct_solution: string;
        explanation: string;
        hearts: number;
        max_hearts: number;
        out_of_hearts: boolean;
      }>(
        `/api/v1/lessons/${activeLesson.id}/check`,
        {
          method: "POST",
          body: JSON.stringify({
            exercise_id: currentExercise.id,
            submitted_answer: submission,
          }),
        },
        token
      );

      setLessonFeedback({
        checked: true,
        is_correct: res.is_correct,
        has_typo: res.has_typo,
        message: res.feedback_message,
        correct_solution: res.correct_solution,
        explanation: res.explanation,
      });

      if (user) {
        setUser({
          ...user,
          stats: {
            ...user.stats,
            hearts: res.hearts,
            max_hearts: res.max_hearts,
          },
        });
      }

      if (res.is_correct) {
        playSoundEffect("correct", user?.sound_enabled ?? true);
        setCorrectCount((prev) => prev + 1);
      } else {
        playSoundEffect("wrong", user?.sound_enabled ?? true);
        if (res.out_of_hearts) {
          setTimeout(() => setOutOfHeartsModal(true), 600);
        }
      }
    } catch (err: any) {
      showNotice(err.message, "error");
    }
  };

  // Advance to next exercise or complete lesson
  const handleContinueLesson = async () => {
    if (!activeLesson) return;
    const nextIdx = currentExIndex + 1;
    if (nextIdx < activeLesson.exercises.length) {
      setCurrentExIndex(nextIdx);
      resetExerciseState();
      const nextEx = activeLesson.exercises[nextIdx];
      if (nextEx?.audio_text) {
        speakPhrase(nextEx.audio_text, nextEx.audio_lang, false, user?.sound_enabled ?? true);
      }
    } else {
      // Complete Lesson via Idempotent Endpoint
      try {
        const idemKey = `lesson-${activeLesson.id}-user-${user?.id}-${Date.now()}`;
        const completeRes = await apiRequest<{
          xp_breakdown: any;
          accuracy: number;
          streak: any;
          newly_unlocked_achievements: any[];
          user: UserProfile;
        }>(
          `/api/v1/lessons/${activeLesson.id}/complete`,
          {
            method: "POST",
            body: JSON.stringify({
              idempotency_key: idemKey,
              correct_count: correctCount,
              total_questions: activeLesson.exercises.length,
            }),
          },
          token
        );

        playSoundEffect("complete", user?.sound_enabled ?? true);
        setUser(completeRes.user);
        setLessonSummary({
          xp_breakdown: completeRes.xp_breakdown,
          accuracy: completeRes.accuracy,
          streak: completeRes.streak,
          newly_unlocked_achievements: completeRes.newly_unlocked_achievements,
        });
        await loadCoursePath(completeRes.user.active_course.id);
      } catch (err: any) {
        showNotice(err.message, "error");
      }
    }
  };

  // Practice Refill (+1 Heart or Full Hearts)
  const handlePracticeRefill = async (full: boolean = false) => {
    try {
      const res = await apiRequest<{ message: string; user: UserProfile }>(
        `/api/v1/hearts/practice?full=${full}`,
        { method: "POST" },
        token
      );
      setUser(res.user);
      setOutOfHeartsModal(false);
      setShowHeartsPopover(false);
      playSoundEffect("correct", user?.sound_enabled ?? true);
      showNotice(full ? "Refilled all 5 Hearts!" : "Practiced & recovered +1 Heart!", "success");
    } catch (err: any) {
      showNotice(err.message, "error");
    }
  };

  // Switch Demo Role (Guest Learner <-> Prof. Sofia Admin)
  const handleSwitchDemoRole = async (accountType: "guest" | "admin") => {
    try {
      const res = await apiRequest<{ access_token: string; user: UserProfile }>(
        "/api/v1/auth/switch-demo",
        {
          method: "POST",
          body: JSON.stringify({ account_type: accountType }),
        }
      );
      setToken(res.access_token);
      setUser(res.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("diolingo_token", res.access_token);
      }
      await loadCoursePath(res.user.active_course.id, res.access_token);
      showNotice(`Switched to ${res.user.display_name}`, "success");
      if (accountType === "admin") {
        setActiveTab("admin");
      }
    } catch (err: any) {
      showNotice(err.message, "error");
    }
  };

  // Handle Login / Register submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const path = authMode === "login" ? "/api/v1/auth/login" : "/api/v1/auth/register";
      const res = await apiRequest<{ access_token: string; user: UserProfile }>(path, {
        method: "POST",
        body: JSON.stringify(authForm),
      });
      setToken(res.access_token);
      setUser(res.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("diolingo_token", res.access_token);
      }
      setShowAuthModal(false);
      await loadCoursePath(res.user.active_course.id, res.access_token);
      showNotice(`Welcome to Diolingo, ${res.user.display_name}!`, "success");
    } catch (err: any) {
      showNotice(err.message, "error");
    }
  };

  // Switch Course
  const handleCourseChange = async (courseId: number) => {
    try {
      const res = await apiRequest<{ user: UserProfile }>(
        `/api/v1/courses/${courseId}/select`,
        { method: "POST" },
        token
      );
      setUser(res.user);
      await loadCoursePath(courseId);
      showNotice(`Switched course to ${res.user.active_course.title} ${res.user.active_course.flag_emoji}`, "success");
    } catch (err: any) {
      showNotice(err.message, "error");
    }
  };

  // Buy Shop Item
  const handleBuyShopItem = async (itemCode: string) => {
    try {
      const res = await apiRequest<{ message: string; user: UserProfile }>(
        "/api/v1/shop/buy",
        {
          method: "POST",
          body: JSON.stringify({ item_code: itemCode }),
        },
        token
      );
      setUser(res.user);
      playSoundEffect("complete", user?.sound_enabled ?? true);
      showNotice(res.message, "success");
      const shopRes = await apiRequest<{ items: any[] }>("/api/v1/shop", {}, token);
      setShopItems(shopRes.items);
    } catch (err: any) {
      showNotice(err.message, "error");
    }
  };

  // Equip Mascot Outfit
  const handleEquipOutfit = async (outfitCode: string) => {
    try {
      const res = await apiRequest<{ message: string; user: UserProfile }>(
        "/api/v1/shop/equip",
        {
          method: "POST",
          body: JSON.stringify({ outfit_code: outfitCode }),
        },
        token
      );
      setUser(res.user);
      showNotice(res.message, "success");
      const shopRes = await apiRequest<{ items: any[] }>("/api/v1/shop", {}, token);
      setShopItems(shopRes.items);
    } catch (err: any) {
      showNotice(err.message, "error");
    }
  };

  const outfitMeta = OUTFIT_BADGES[user?.equipped_outfit || "classic"] || OUTFIT_BADGES.classic;
  const dailyGoalPct = user
    ? Math.min(100, Math.round((user.stats.xp_today / Math.max(1, user.daily_xp_goal)) * 100))
    : 0;

  // Winding S-curve horizontal offsets in px
  const pathOffsets = [0, -48, -76, -32, 32, 76, 40, -24];


  return (
    <div className="min-h-screen flex flex-col">
      {topViewMode === "landing" ? (
        <DuolingoLandingPage
          onOpenAuth={(mode) => {
            setOnboardingAuthMode(mode);
            setShowAuthModal(true);
          }}
          onSelectLanguageFastTrack={(slug) => {
            setShowCoursePicker(true);
          }}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          userDisplayName={user?.display_name}
          onEnterApp={async () => {
            if (user) {
              setTopViewMode("dashboard");
            } else {
              const guestToken = "diolingo_guest_session_" + Date.now();
              if (typeof window !== "undefined") {
                localStorage.setItem("diolingo_token", guestToken);
              }
              setToken(guestToken);
              setUser(FALLBACK_USER as any);
              setTopViewMode("dashboard");
              await loadCoursePath(1, guestToken);
              showNotice("Welcome to Diolingo! Direct access active.", "success");
            }
          }}
        />
      ) : (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F9FA] text-[#3C3C3C] pt-16">
          {/* Toast Notification */}
          {toast && (
            <div
              role="status"
              aria-live="polite"
              className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border-b-4 font-extrabold text-sm transition-all ${toast.tone === "error"
                  ? "bg-[#FF4B4B] border-[#EA2B2B] text-white"
                  : toast.tone === "success"
                    ? "bg-[#58CC02] border-[#46A302] text-white"
                    : "bg-[#1CB0F6] border-[#1899D6] text-white"
                }`}
            >
              <span>{toast.text}</span>
              <button onClick={() => setToast(null)} className="opacity-80 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Left Sidebar Navigation (Desktop) */}
          <aside className="hidden md:flex md:w-64 lg:w-72 flex-col justify-between bg-white border-r-2 border-[#E5E5E5] px-5 py-6 sticky top-0 h-screen select-none">
            <div>
              {/* Diolingo Logo Header */}
              <button
                onClick={() => setActiveTab("learn")}
                className="flex items-center gap-3 px-2 mb-8 group focus:outline-none"
              >
                <img
                  src="/mascot-dio.png"
                  alt="Dio Mascot"
                  className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                />
                <img
                  src="/logo-diolingo.png"
                  alt="diolingo"
                  className="h-9 w-auto object-contain"
                />
              </button>

              {/* Navigation Links */}
              <nav className="space-y-2" aria-label="Main Navigation">
                {[
                  { id: "learn", label: "LEARN", icon: BookOpen, color: "text-[#58CC02]" },
                  { id: "leaderboard", label: "LEADERBOARDS", icon: Trophy, color: "text-[#FFC800]" },
                  { id: "shop", label: "SHOP", icon: ShoppingBag, color: "text-[#FF4B4B]" },
                  { id: "profile", label: "PROFILE", icon: UserIcon, color: "text-[#1CB0F6]" },
                  { id: "settings", label: "SETTINGS", icon: SettingsIcon, color: "text-slate-500" },
                  { id: "admin", label: "ADMIN STUDIO", icon: ShieldAlert, color: "text-[#CE82FF]" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        playSoundEffect("click", user?.sound_enabled ?? true);
                        setActiveTab(item.id as NavTab);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-extrabold text-sm tracking-wider transition-all ${isActive
                          ? "bg-[#DDF4FF] text-[#1CB0F6] border-2 border-[#84D8FF]"
                          : "text-[#777777] hover:bg-slate-100 border-2 border-transparent"
                        }`}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? "text-[#1CB0F6]" : item.color}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Demo Role Switcher & Educational Disclaimer */}
            <div className="space-y-3 pt-4 border-t-2 border-[#E5E5E5]">
              <div className="bg-slate-50 p-3 rounded-2xl border-2 border-[#E5E5E5]">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Quick Grader Switcher
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleSwitchDemoRole("guest")}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition ${user?.role !== "admin"
                        ? "bg-[#58CC02] text-white border-[#46A302]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    Guest Demo
                  </button>
                  <button
                    onClick={() => handleSwitchDemoRole("admin")}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition ${user?.role === "admin"
                        ? "bg-[#CE82FF] text-white border-[#A560E8]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    Admin Role
                  </button>
                </div>
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-extrabold text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setOnboardingAuthMode("login");
                      setShowAuthModal(true);
                    }}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-extrabold text-[#1CB0F6] hover:bg-[#DDF4FF] transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In / Create Account</span>
                  </button>
                )}
              </div>

              <p className="text-[10px] leading-snug text-slate-400 font-semibold px-1">
                <strong>Diolingo Educational Portfolio Project.</strong> Non-commercial implementation with original code &amp; Dio mascot. Not affiliated with Duolingo, Inc.
              </p>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-10">
            {/* Persistent Top Gamification Status Bar */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b-2 border-[#E5E5E5] px-4 lg:px-8 py-3">
              <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
                {/* Mobile Logo + Course Selector + Return to Landing */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTopViewMode("landing")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-zinc-400 hover:text-white bg-white/[0.04] border border-white/[0.08] transition mr-1"
                    title="Return to Landing Page"
                  >
                    ← Landing
                  </button>
                  <img
                    src="/logo-diolingo.png"
                    alt="diolingo"
                    className="h-7 w-auto md:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCoursePicker(true)}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-[#E5E5E5] transition group text-left cursor-pointer"
                    title="Browse 60+ World Languages"
                  >
                    <span className="text-xl leading-none">{user?.active_course.flag_emoji || "🌐"}</span>
                    <span className="font-extrabold text-sm text-[#3C3C3C] hidden sm:inline">
                      {user?.active_course.title}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 rotate-90 group-hover:text-slate-800 transition" />
                  </button>
                </div>

                {/* Gamification Counters: Streak, Gems, Hearts, League, Daily Goal */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Streak Flame */}
                  <div
                    title={
                      user?.stats.streak_freeze_equipped
                        ? "Streak Freeze Equipped! Your streak is protected for 1 missed day."
                        : "Daily Activity Streak"
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl hover:bg-slate-100 cursor-pointer transition"
                    onClick={() => setActiveTab("profile")}
                  >
                    <Flame
                      className={`w-6 h-6 ${(user?.stats.streak_count || 0) > 0
                          ? "text-[#FF9600] fill-[#FF9600]"
                          : "text-slate-300"
                        }`}
                    />
                    <span className="font-extrabold text-base">
                      <GradientText variant="gold">{user?.stats.streak_count || 0}</GradientText>
                    </span>
                    {user?.stats.streak_freeze_equipped && (
                      <span className="text-xs bg-sky-100 text-sky-700 font-extrabold px-1.5 py-0.5 rounded-lg">

                      </span>
                    )}
                  </div>

                  {/* Gems */}
                  <button
                    onClick={() => setActiveTab("shop")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl hover:bg-slate-100 transition"
                    title="Spend Gems in the Diolingo Shop"
                  >
                    <Gem className="w-5 h-5 text-[#1CB0F6] fill-[#1CB0F6]" />
                    <span className="font-extrabold text-[#1CB0F6] text-base">
                      {user?.stats.gems || 0}
                    </span>
                  </button>

                  {/* Hearts + Popover */}
                  <div className="relative">
                    <button
                      onClick={() => setShowHeartsPopover((prev) => !prev)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl hover:bg-rose-50 transition"
                      title="Hearts Health & Regeneration"
                    >
                      <Heart className="w-5 h-5 text-[#FF4B4B] fill-[#FF4B4B]" />
                      <span className="font-extrabold text-[#FF4B4B] text-base">
                        {user?.stats.hearts ?? 5}
                      </span>
                    </button>

                    {showHeartsPopover && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border-2 border-[#E5E5E5] p-4 z-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-base text-[#3C3C3C]">
                            Hearts ({user?.stats.hearts}/{user?.stats.max_hearts})
                          </span>
                          <button onClick={() => setShowHeartsPopover(false)}>
                            <X className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 my-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Heart
                              key={i}
                              className={`w-6 h-6 ${i < (user?.stats.hearts || 0)
                                  ? "text-[#FF4B4B] fill-[#FF4B4B]"
                                  : "text-slate-200 fill-slate-200"
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mb-3">
                          {(user?.stats.hearts || 0) >= 5
                            ? "Your hearts are full! Keep learning!"
                            : `Next heart regenerates in ${Math.ceil(
                              (user?.stats.seconds_until_next_heart || 3600) / 60
                            )} mins (+1 every 4h).`}
                        </p>
                        <button
                          onClick={() => handlePracticeRefill(false)}
                          className="w-full btn-3d-sky py-2.5 text-xs uppercase tracking-wider mb-2"
                        >
                          Practice to Refill (+1 Heart)
                        </button>
                        <button
                          onClick={() => handlePracticeRefill(true)}
                          className="w-full btn-3d-green py-2 text-xs uppercase tracking-wider"
                        >
                          Instant Full Refill (Demo)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* XP Boost Pill if active */}
                  {user?.stats.xp_boost_active && (
                    <div className="hidden sm:flex items-center gap-1 bg-purple-100 text-[#CE82FF] border border-purple-300 px-2.5 py-1 rounded-xl text-xs font-extrabold">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>2x XP ACTIVE</span>
                    </div>
                  )}

                  {/* Daily XP Goal Ring */}
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-2xl bg-emerald-50 border border-emerald-200"
                    title="Daily XP Goal Progress"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#58CC02] text-white flex items-center justify-center text-[11px] font-black">
                      {dailyGoalPct}%
                    </div>
                    <span className="text-xs font-extrabold text-[#46A302]">
                      {user?.stats.xp_today || 0}/{user?.daily_xp_goal || 20} XP
                    </span>
                  </button>
                </div>
              </div>
            </header>

            {/* Main View Switcher */}
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 lg:px-8 py-6">
              {/* 1. LEARN TAB: Winding Vertical Path + Right Companion Sidebar */}
              {activeTab === "learn" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left 8 cols: Winding Learning Path */}
                  <div className="lg:col-span-8 space-y-10">
                    {units.map((unit) => {
                      const bannerBg =
                        unit.theme_color === "sky"
                          ? "bg-[#1CB0F6] border-[#1899D6]"
                          : unit.theme_color === "purple"
                            ? "bg-[#CE82FF] border-[#A560E8]"
                            : unit.theme_color === "amber"
                              ? "bg-[#FFC800] border-[#E5B400] text-slate-900"
                              : "bg-[#58CC02] border-[#46A302]";

                      return (
                        <section key={unit.id} className="space-y-8">
                          {/* Unit Header Banner */}
                          <div
                            className={`${bannerBg} text-white rounded-3xl p-5 sm:p-6 border-b-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md`}
                          >
                            <div>
                              <span className="text-xs font-black uppercase tracking-widest opacity-85">
                                {user?.active_course.flag_emoji} {user?.active_course.title} • SECTION {unit.order_index}
                              </span>
                              <h2 className="text-xl sm:text-2xl font-black mt-0.5">{unit.title}</h2>
                              <p className="text-sm font-semibold opacity-95 mt-1">{unit.description}</p>
                            </div>
                            <button
                              onClick={() => setGuidebookUnit(unit)}
                              className="self-start sm:self-center flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2.5 rounded-2xl border-2 border-white/40 font-extrabold text-sm transition shrink-0"
                            >
                              <BookOpen className="w-5 h-5" />
                              <span>GUIDEBOOK</span>
                            </button>
                          </div>

                          {/* Winding S-Curve Nodes */}
                          <div className="relative flex flex-col items-center py-4 space-y-7">
                            {unit.skills.map((skill, sIdx) => {
                              const offset = pathOffsets[sIdx % pathOffsets.length];
                              const isCompleted = skill.state === "completed" || skill.state === "legendary";
                              // Open unit navigation: every node in an unlocked unit is playable immediately
                              const isUnlocked = skill.is_unlocked ?? (unit.is_unlocked ?? (skill.state !== "locked"));
                              const isLocked = !isUnlocked && !isCompleted;
                              const isActive = isUnlocked && !isCompleted;

                              return (
                                <div
                                  key={skill.id}
                                  style={{ transform: `translateX(${offset}px)` }}
                                  className="relative flex flex-col items-center group"
                                >
                                  {/* Bouncing START Badge for the Recommended Skill */}
                                  {isActive && sIdx === 0 && (
                                    <div className="mb-2 bg-white text-[#58CC02] font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-2xl border-2 border-[#E5E5E5] shadow-md animate-bounce">
                                      START +{skill.xp_reward} XP
                                    </div>
                                  )}

                                  <div className="relative flex items-center">
                                    {/* 2-Layer Duolingo Tactile Circular Node Button */}
                                    <button
                                      type="button"
                                      disabled={isLocked}
                                      onClick={() => !isLocked && startLesson(skill)}
                                      aria-label={`${skill.title} (${skill.state})`}
                                      className={`path-node-btn ${isCompleted
                                          ? "node-completed"
                                          : isUnlocked
                                            ? "node-unlocked"
                                            : "node-locked"
                                        } ${isActive ? "beacon-ring" : ""}`}
                                    >
                                      <span className="path-node-shadow" />
                                      <span className="path-node-face">
                                        {skill.is_checkpoint ? (
                                          <Trophy className="w-8 h-8" />
                                        ) : skill.is_bonus_legendary ? (
                                          <Crown className="w-8 h-8" />
                                        ) : isCompleted ? (
                                          <Check className="w-9 h-9 stroke-[3]" />
                                        ) : isLocked ? (
                                          <Lock className="w-7 h-7" />
                                        ) : (
                                          <Star className="w-8 h-8 fill-current" />
                                        )}
                                      </span>
                                    </button>

                                    {/* Crown Level Badge */}
                                    <div
                                      className={`absolute -bottom-1 -right-2 px-2 py-0.5 rounded-full text-[11px] font-black border-2 border-white flex items-center gap-0.5 shadow ${skill.crowns > 0
                                          ? "bg-[#FFC800] text-[#785900]"
                                          : "bg-slate-200 text-slate-600"
                                        }`}
                                    >
                                      <Crown className="w-3 h-3 fill-current" />
                                      <span>
                                        {skill.crowns}/{skill.max_crowns}
                                      </span>
                                    </div>

                                    {/* Dio Mascot Cheering Next to Active Skill */}
                                    {isActive && (
                                      <div className="hidden sm:flex items-center gap-2 absolute left-24 w-48 pointer-events-none">
                                        <img
                                          src="/mascot-dio.png"
                                          alt="Dio cheering"
                                          className="w-20 h-20 object-contain animate-float drop-shadow"
                                        />
                                        <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl px-3 py-2 text-xs font-extrabold text-[#4B4B4B] shadow-sm">
                                          ¡Vamos! Let&apos;s earn a crown!
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Skill Title & Meta */}
                                  <div className="mt-2.5 text-center max-w-[180px]">
                                    <p className="font-extrabold text-sm text-[#3C3C3C] leading-tight">
                                      {skill.title}
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-400">
                                      {skill.is_checkpoint
                                        ? "Unit Gate Exam"
                                        : skill.is_bonus_legendary
                                          ? "Legendary Boss • 2x XP"
                                          : `${skill.xp_reward} XP Lesson`}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>

                  {/* Right 4 cols: Dio Mascot Companion Card, Daily Quests & League Preview */}
                  <div className="lg:col-span-4 space-y-6 sticky top-20">
                    {/* Dio Companion Welcome Card (SpotlightCard) */}
                    <SpotlightCard
                      spotlightColor="rgba(30, 143, 91, 0.14)"
                      className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`relative p-1.5 rounded-2xl ring-4 ${outfitMeta.ring} bg-emerald-50`}>
                          <img
                            src="/mascot-dio.png"
                            alt="Dio the Cockatiel"
                            className="w-16 h-16 object-contain"
                          />
                          <span className="absolute -top-2 -right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/10">{outfitMeta.badge}</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#58CC02]">
                            {outfitMeta.label}
                          </span>
                          <h3 className="text-lg font-black text-[#3C3C3C]">
                            ¡Hola, {user?.display_name.split(" ")[0]}!
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            Complete 1 lesson today to extend your{" "}
                            <strong className="text-[#FF9600]">{user?.stats.streak_count}-day streak</strong>!
                          </p>
                        </div>
                      </div>
                    </SpotlightCard>

                    {/* Daily XP Goal Card (SpotlightCard) */}
                    <SpotlightCard
                      spotlightColor="rgba(244, 185, 63, 0.22)"
                      className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-base text-[#3C3C3C] flex items-center gap-2">
                          <Zap className="w-5 h-5 text-[#FFC800] fill-[#FFC800]" />
                          <span>Daily XP Goal</span>
                        </h3>
                        <span className="text-xs font-extrabold text-[#58CC02]">
                          {user?.stats.xp_today || 0} / {user?.daily_xp_goal || 20} XP
                        </span>
                      </div>
                      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          style={{ width: `${dailyGoalPct}%` }}
                          className="h-full bg-[#58CC02] rounded-full transition-all duration-500"
                        />
                      </div>
                      <p className="text-xs font-semibold text-slate-500">
                        {dailyGoalPct >= 100
                          ? "Daily goal reached! Bonus gems unlocked!"
                          : `Earn ${Math.max(0, (user?.daily_xp_goal || 20) - (user?.stats.xp_today || 0))} more XP today to hit your target.`}
                      </p>
                    </SpotlightCard>

                    {/* Practice to Earn Hearts (PixelCard per §VI) */}
                    <PixelCard className="p-4 bg-[#FFF8EC]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-[#FF4B4B] font-black">
                            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-wider text-[#1C2A22]">
                              Practice to Earn Hearts
                            </p>
                            <p className="text-[11px] font-bold text-[#4A5D52]">
                              Current vitality: {user?.stats.hearts ?? 5}/{user?.stats.max_hearts ?? 5} Hearts
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePracticeRefill(false)}
                          className="px-3.5 py-2 rounded-xl bg-[#1E8F5B] text-[#FFF8EC] text-xs font-black uppercase tracking-wider shadow hover:bg-[#146A44] transition"
                        >
                          +1 Heart
                        </button>
                      </div>
                    </PixelCard>

                    {/* Super Diolingo Promo Card */}
                    <div className="bg-gradient-to-br from-[#1CB0F6] via-[#6366F1] to-[#CE82FF] rounded-3xl p-5 text-white shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          SUPER DIOLINGO
                        </span>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-lg leading-snug">
                        Unlimited Hearts & Legendary Mastery
                      </h4>
                      <p className="text-xs font-semibold opacity-90 mt-1 mb-4">
                        Preview our ad-free educational tier with personalized mistake review.
                      </p>
                      <button
                        onClick={() => setShowSuperModal(true)}
                        className="w-full bg-white text-[#4F46E5] font-black text-xs uppercase tracking-wider py-2.5 rounded-2xl border-b-4 border-indigo-200 active:border-b-0 active:translate-y-1 transition"
                      >
                        Preview Super Benefits
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. LEADERBOARD TAB */}
              {activeTab === "leaderboard" && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 text-center space-y-4">
                    <div className="flex justify-center gap-3">
                      {["Bronze", "Silver", "Gold"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setLbTier(t)}
                          className={`px-4 py-2 rounded-2xl font-extrabold text-sm border-2 transition ${lbTier === t
                              ? "bg-[#FFF8DC] border-[#FFC800] text-[#9A7400]"
                              : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                            }`}
                        >
                          {t} League
                        </button>
                      ))}
                    </div>

                    <h2 className="text-2xl font-black text-[#3C3C3C]">{lbTier} League Standings</h2>
                    <p className="text-sm font-semibold text-slate-500">
                      Top 3 learners advance to the next league tier at the end of the week!
                    </p>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        <button
                          onClick={() => setLbScope("global")}
                          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition ${lbScope === "global"
                              ? "bg-white text-[#1CB0F6] shadow-sm"
                              : "text-slate-500"
                            }`}
                        >
                          Global League
                        </button>
                        <button
                          onClick={() => setLbScope("friends")}
                          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition ${lbScope === "friends"
                              ? "bg-white text-[#1CB0F6] shadow-sm"
                              : "text-slate-500"
                            }`}
                        >
                          Friends ({user?.following_count || 0})
                        </button>
                      </div>

                      <button
                        onClick={() => setShowShareCardModal(true)}
                        className="btn-3d-sky px-4 py-2 text-xs flex items-center gap-1.5"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share Rank Card</span>
                      </button>
                    </div>
                  </div>

                  {/* Standings List */}
                  <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] overflow-hidden divide-y-2 divide-[#F0F0F0]">
                    {standings.map((row, index) => {
                      const showPromoBanner = index === 2 && lbScope === "global";
                      return (
                        <React.Fragment key={row.user_id}>
                          <div
                            className={`flex items-center justify-between px-5 py-4 transition ${row.is_current_user ? "bg-[#E8F9DF]" : "hover:bg-slate-50"
                              }`}
                          >
                            <div className="flex items-center gap-4">
                              <span
                                className={`w-8 text-center font-black text-base ${row.rank === 1
                                    ? "text-[#FFC800]"
                                    : row.rank === 2
                                      ? "text-slate-400"
                                      : row.rank === 3
                                        ? "text-amber-700"
                                        : "text-slate-500"
                                  }`}
                              >
                                {row.rank <= 3 ? ["", "", ""][row.rank - 1] : row.rank}
                              </span>
                              <img
                                src="/mascot-dio.png"
                                alt={row.display_name}
                                className="w-11 h-11 rounded-full bg-emerald-50 border-2 border-emerald-200 object-contain p-1"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-extrabold text-sm sm:text-base text-[#3C3C3C]">
                                    {row.display_name}
                                  </p>
                                  {row.is_current_user && (
                                    <span className="text-[10px] font-black uppercase bg-[#58CC02] text-white px-2 py-0.5 rounded-full">
                                      YOU
                                    </span>
                                  )}
                                  {row.is_friend && !row.is_current_user && (
                                    <span className="text-[10px] font-black uppercase bg-[#DDF4FF] text-[#1CB0F6] px-2 py-0.5 rounded-full">
                                      FRIEND
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-slate-400">
                                  {row.streak_count}d streak • @{row.username}
                                </p>
                              </div>
                            </div>
                            <span className="font-black text-base text-[#58CC02]">{row.xp_total} XP</span>
                          </div>
                          {showPromoBanner && (
                            <div className="bg-emerald-50 text-[#46A302] text-center py-2 text-xs font-black uppercase tracking-widest">
                              ▲ Promotion Zone — Top 3 Advance to Next League Tier ▲
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. SHOP TAB */}
              {activeTab === "shop" && (
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img src="/mascot-dio.png" alt="Dio Shopkeeper" className="w-20 h-20 object-contain" />
                      <div>
                        <h2 className="text-2xl font-black text-[#3C3C3C]">Diolingo Gem Shop</h2>
                        <p className="text-sm font-semibold text-slate-500">
                          Power up your streak, activate 2x XP potions, or dress Dio in custom outfits!
                        </p>
                      </div>
                    </div>
                    <div className="bg-[#DDF4FF] border-2 border-[#84D8FF] px-5 py-3 rounded-2xl flex items-center gap-2 shrink-0">
                      <Gem className="w-6 h-6 text-[#1CB0F6] fill-[#1CB0F6]" />
                      <span className="font-black text-xl text-[#1CB0F6]">{user?.stats.gems || 0} Gems</span>
                    </div>
                  </div>

                  {/* Power-Ups Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-wider text-slate-500">
                      Learning Power-Ups
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {shopItems
                        .filter((i) => i.category === "powerup")
                        .map((item) => (
                          <div
                            key={item.code}
                            className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-5 flex flex-col justify-between gap-4"
                          >
                            <div>
                              <div className="text-4xl mb-3">{item.icon_emoji}</div>
                              <h4 className="font-black text-base text-[#3C3C3C]">{item.name}</h4>
                              <p className="text-xs font-semibold text-slate-500 mt-1">{item.description}</p>
                            </div>
                            <button
                              onClick={() => handleBuyShopItem(item.code)}
                              disabled={item.owned && item.code === "streak_freeze"}
                              className={`w-full py-2.5 text-xs uppercase tracking-wider ${item.owned && item.code === "streak_freeze"
                                  ? "bg-slate-100 text-slate-400 font-extrabold rounded-2xl cursor-not-allowed"
                                  : "btn-3d-green"
                                }`}
                            >
                              {item.owned && item.code === "streak_freeze"
                                ? "EQUIPPED"
                                : `BUY • ${item.price_gems} `}
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Mascot Cosmetic Outfits Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black uppercase tracking-wider text-slate-500">
                        Dio Mascot Wardrobe
                      </h3>
                      {user?.equipped_outfit !== "classic" && (
                        <button
                          onClick={() => handleEquipOutfit("classic")}
                          className="text-xs font-extrabold text-[#1CB0F6] hover:underline"
                        >
                          Reset to Classic Dio
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {shopItems
                        .filter((i) => i.category === "outfit")
                        .map((item) => (
                          <div
                            key={item.code}
                            className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-5 flex flex-col justify-between gap-4"
                          >
                            <div>
                              <div className="relative w-20 h-20 mx-auto mb-3 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                <img
                                  src="/mascot-dio.png"
                                  alt={item.name}
                                  className="w-16 h-16 object-contain"
                                />
                                <span className="absolute -top-2 -right-2 text-2xl">{item.icon_emoji}</span>
                              </div>
                              <h4 className="font-black text-base text-[#3C3C3C] text-center">{item.name}</h4>
                              <p className="text-xs font-semibold text-slate-500 mt-1 text-center">
                                {item.description}
                              </p>
                            </div>
                            {item.equipped ? (
                              <div className="w-full py-2.5 text-center bg-emerald-100 text-[#46A302] font-black text-xs rounded-2xl">
                                WEARING NOW
                              </div>
                            ) : item.owned ? (
                              <button
                                onClick={() => handleEquipOutfit(item.code)}
                                className="w-full btn-3d-sky py-2.5 text-xs uppercase tracking-wider"
                              >
                                EQUIP OUTFIT
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBuyShopItem(item.code)}
                                className="w-full btn-3d-gold py-2.5 text-xs uppercase tracking-wider"
                              >
                                UNLOCK • {item.price_gems}
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PROFILE & SOCIAL GRAPH TAB */}
              {activeTab === "profile" && (
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Profile Header Card */}
                  <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                      <div className={`relative p-2 rounded-3xl bg-emerald-50 ring-4 ${outfitMeta.ring}`}>
                        <img src="/mascot-dio.png" alt="Profile Avatar" className="w-24 h-24 object-contain" />
                        <span className="absolute -bottom-2 -right-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-200 border border-white/10 shadow">
                          {outfitMeta.badge}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-[#3C3C3C]">{user?.display_name}</h2>
                        <p className="text-sm font-bold text-slate-400">
                          @{user?.username} • Joined{" "}
                          {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                        </p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                          <span className="bg-[#DDF4FF] text-[#1CB0F6] font-extrabold text-xs px-3 py-1 rounded-xl">
                            {user?.active_course.flag_emoji} {user?.active_course.title}
                          </span>
                          <span className="bg-amber-100 text-amber-800 font-extrabold text-xs px-3 py-1 rounded-xl">
                            {user?.stats.league_tier} League
                          </span>
                          <span className="bg-emerald-100 text-[#46A302] font-extrabold text-xs px-3 py-1 rounded-xl">
                            {user?.following_count} Following • {user?.followers_count} Followers
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                      <div className="bg-slate-50 border-2 border-[#E5E5E5] rounded-2xl px-4 py-3">
                        <p className="text-xl font-black text-[#FF9600]"> {user?.stats.streak_count}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase">Day Streak</p>
                      </div>
                      <div className="bg-slate-50 border-2 border-[#E5E5E5] rounded-2xl px-4 py-3">
                        <p className="text-xl font-black text-[#58CC02]"> {user?.stats.xp_total}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase">Total XP</p>
                      </div>
                      <div className="bg-slate-50 border-2 border-[#E5E5E5] rounded-2xl px-4 py-3">
                        <p className="text-xl font-black text-[#FFC800]"> {user?.stats.total_crowns}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase">Crowns</p>
                      </div>
                      <div className="bg-slate-50 border-2 border-[#E5E5E5] rounded-2xl px-4 py-3">
                        <p className="text-xl font-black text-[#1CB0F6]">
                          {user?.stats.perfect_lessons_count}
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase">Perfect Runs</p>
                      </div>
                    </div>
                  </div>

                  {/* Achievements / Badges Shelf */}
                  <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 space-y-4">
                    <h3 className="text-lg font-black text-[#3C3C3C] flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#FFC800]" />
                      <span>Achievement & Badge Shelf</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user?.achievements.map((ach) => {
                        const pct = Math.min(100, Math.round((ach.current_value / ach.target_value) * 100));
                        return (
                          <div
                            key={ach.id}
                            className={`p-4 rounded-2xl border-2 flex items-center gap-4 ${ach.unlocked
                                ? "bg-[#FFFBEB] border-[#FFC800]"
                                : "bg-slate-50 border-slate-200 opacity-75"
                              }`}
                          >
                            <div className="text-3xl bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                              {ach.icon_emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-black text-sm text-[#3C3C3C]">{ach.title}</h4>
                                <span className="text-xs font-extrabold text-[#1CB0F6]">
                                  +{ach.gem_reward}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-500 mt-0.5">{ach.description}</p>
                              <div className="mt-2 w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${pct}%` }}
                                  className={`h-full rounded-full ${ach.unlocked ? "bg-[#FFC800]" : "bg-[#58CC02]"
                                    }`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Social Friend Search & Follow Graph */}
                  <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h3 className="text-lg font-black text-[#3C3C3C] flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#1CB0F6]" />
                        <span>Find & Follow Friends</span>
                      </h3>
                      <input
                        type="text"
                        value={learnerSearchQuery}
                        onChange={(e) => setLearnerSearchQuery(e.target.value)}
                        placeholder="Search learners by username or name..."
                        className="bg-slate-100 border-2 border-[#E5E5E5] rounded-2xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-[#1CB0F6] w-full sm:w-72"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {learnersList.map((learner) => (
                        <div
                          key={learner.id}
                          className="p-3.5 rounded-2xl border-2 border-[#E5E5E5] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src="/mascot-dio.png"
                              alt={learner.display_name}
                              className="w-10 h-10 rounded-full bg-emerald-50 p-1 object-contain"
                            />
                            <div>
                              <p className="font-extrabold text-sm text-[#3C3C3C]">{learner.display_name}</p>
                              <p className="text-xs font-semibold text-slate-400">
                                @{learner.username} • {learner.xp_total} XP
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              const res = await apiRequest<{ action: string; user: UserProfile }>(
                                `/api/v1/social/follow/${learner.id}`,
                                { method: "POST" },
                                token
                              );
                              setUser(res.user);
                              setLearnersList((prev) =>
                                prev.map((l) =>
                                  l.id === learner.id ? { ...l, is_following: res.action === "followed" } : l
                                )
                              );
                              showNotice(
                                res.action === "followed"
                                  ? `Now following ${learner.display_name}!`
                                  : `Unfollowed ${learner.display_name}.`,
                                "success"
                              );
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${learner.is_following
                                ? "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                                : "bg-[#1CB0F6] text-white hover:bg-[#2BD8FF]"
                              }`}
                          >
                            {learner.is_following ? "Following" : "+ Follow"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. SETTINGS TAB */}
              {activeTab === "settings" && user && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 space-y-5">
                    <h2 className="text-2xl font-black text-[#3C3C3C]">Learning & Account Settings</h2>

                    {/* Display Name */}
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-1.5">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={user.display_name}
                        onChange={(e) => setUser({ ...user, display_name: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-[#E5E5E5] rounded-2xl px-4 py-2.5 font-bold text-sm"
                      />
                    </div>

                    {/* Daily XP Goal Selector */}
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2">
                        Daily XP Goal Target
                      </label>
                      <div className="grid grid-cols-4 gap-2.5">
                        {[
                          { xp: 10, title: "Casual" },
                          { xp: 20, title: "Regular" },
                          { xp: 30, title: "Serious" },
                          { xp: 50, title: "Intense" },
                        ].map((g) => (
                          <button
                            key={g.xp}
                            onClick={() => setUser({ ...user, daily_xp_goal: g.xp })}
                            className={`p-3 rounded-2xl border-2 text-center transition ${user.daily_xp_goal === g.xp
                                ? "bg-[#E8F9DF] border-[#58CC02] text-[#46A302]"
                                : "bg-white border-[#E5E5E5] text-slate-600"
                              }`}
                          >
                            <p className="font-black text-sm">{g.title}</p>
                            <p className="text-xs font-bold opacity-80">{g.xp} XP/day</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sound & Accessibility Toggles */}
                    <div className="space-y-3 pt-2">
                      {[
                        { key: "sound_enabled", label: "Sound Effects & Web Speech TTS Audio" },
                        { key: "listening_enabled", label: "Listening Exercises" },
                        { key: "speaking_enabled", label: "Microphone Speaking Exercises" },
                        { key: "notifications_enabled", label: "Daily Streak Reminder Notifications" },
                      ].map((item) => {
                        const checked = Boolean((user as any)[item.key]);
                        return (
                          <label
                            key={item.key}
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer"
                          >
                            <span className="font-extrabold text-sm text-[#3C3C3C]">{item.label}</span>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                setUser({ ...user, [item.key]: e.target.checked } as UserProfile)
                              }
                              className="w-5 h-5 accent-[#58CC02]"
                            />
                          </label>
                        );
                      })}
                    </div>

                    <button
                      onClick={async () => {
                        const res = await apiRequest<{ message: string; user: UserProfile }>(
                          "/api/v1/settings",
                          {
                            method: "PUT",
                            body: JSON.stringify({
                              display_name: user.display_name,
                              daily_xp_goal: user.daily_xp_goal,
                              sound_enabled: user.sound_enabled,
                              speaking_enabled: user.speaking_enabled,
                              listening_enabled: user.listening_enabled,
                              notifications_enabled: user.notifications_enabled,
                            }),
                          },
                          token
                        );
                        setUser(res.user);
                        showNotice(res.message, "success");
                      }}
                      className="w-full btn-3d-green py-3 text-sm uppercase tracking-wider"
                    >
                      Save Preferences
                    </button>
                  </div>

                  {/* OAuth Social Login Stubs (Section IV.1) */}
                  <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 space-y-3">
                    <h3 className="font-black text-base text-[#3C3C3C]">
                      Connected Social Accounts (OAuth 2.0 Stubs)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {["Google", "Apple", "Facebook"].map((provider) => (
                        <button
                          key={provider}
                          onClick={async () => {
                            const res = await apiRequest<{ message: string }>(
                              `/api/v1/auth/oauth/${provider.toLowerCase()}`,
                              { method: "POST" }
                            );
                            showNotice(res.message, "info");
                          }}
                          className="btn-3d-white py-2.5 px-3 text-xs flex items-center justify-between"
                        >
                          <span>{provider}</span>
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md text-[10px] font-black">
                            Coming Soon
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Data Portability & Progress Reset */}
                  <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={async () => {
                        const data = await apiRequest<any>("/api/v1/settings/export", {}, token);
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `diolingo-export-${user.username}.json`;
                        a.click();
                        showNotice("Downloaded JSON account archive!", "success");
                      }}
                      className="flex-1 btn-3d-sky py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Account Data (JSON)</span>
                    </button>
                    <button
                      onClick={async () => {
                        const res = await apiRequest<{ message: string; user: UserProfile }>(
                          "/api/v1/settings/reset-progress",
                          { method: "POST" },
                          token
                        );
                        setUser(res.user);
                        await loadCoursePath(res.user.active_course.id);
                        showNotice(res.message, "info");
                      }}
                      className="flex-1 btn-3d-coral py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Course Progress</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 6. ADMIN STUDIO & OPERATIONS TAB */}
              {activeTab === "admin" && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-[#312E81] to-[#6D28D9] text-white rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                        ADMIN STUDIO & ANALYTICS
                      </span>
                      <h2 className="text-2xl font-black mt-2">
                        Content Authoring Pipeline & Operations
                      </h2>
                      <p className="text-sm opacity-90 font-semibold">
                        Manage Units, Skills, Exercises, Bulk JSON/CSV Imports, Learner Accounts, and Content Telemetry.
                      </p>
                    </div>
                    {user?.role !== "admin" && (
                      <button
                        onClick={() => handleSwitchDemoRole("admin")}
                        className="btn-3d-gold px-4 py-2.5 text-xs shrink-0"
                      >
                        ️ Switch to Admin Role
                      </button>
                    )}
                  </div>

                  {/* KPI Cards */}
                  {adminAnalytics && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: "Total Registered Users", val: adminAnalytics.kpis.total_users, color: "text-[#1CB0F6]" },
                        { label: "7-Day Active Learners", val: adminAnalytics.kpis.active_users_7d, color: "text-[#58CC02]" },
                        { label: "Lessons Completed", val: adminAnalytics.kpis.total_lessons_completed, color: "text-[#FFC800]" },
                        { label: "Exercises Authored", val: adminAnalytics.kpis.total_exercises_authored, color: "text-[#CE82FF]" },
                      ].map((k) => (
                        <div key={k.label} className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-5">
                          <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
                          <p className="text-xs font-extrabold text-slate-400 uppercase mt-1">{k.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Funnel & Most Missed Exercises */}
                  {adminAnalytics && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Lesson Completion Funnel */}
                      <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 space-y-4">
                        <h3 className="font-black text-base text-[#3C3C3C]">
                          Lesson Completion Conversion Funnel
                        </h3>
                        <div className="space-y-3">
                          {adminAnalytics.lesson_funnel.map((stage: any) => (
                            <div key={stage.stage} className="space-y-1">
                              <div className="flex justify-between text-xs font-extrabold">
                                <span>{stage.stage}</span>
                                <span className="text-[#58CC02]">
                                  {stage.users} users ({stage.rate}%)
                                </span>
                              </div>
                              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${stage.rate}%` }}
                                  className="h-full bg-[#58CC02] rounded-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Most-Missed Exercises Telemetry */}
                      <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 space-y-4">
                        <h3 className="font-black text-base text-[#3C3C3C]">
                          Most-Missed Exercises (Difficulty Hotspots)
                        </h3>
                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                          {adminAnalytics.most_missed_exercises.map((m: any) => (
                            <div
                              key={m.exercise_id}
                              className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <p className="font-extrabold text-xs text-[#3C3C3C] truncate">
                                  [{m.exercise_type}] {m.source_sentence || m.prompt_text}
                                </p>
                                <p className="text-[11px] font-semibold text-slate-500 truncate">
                                  Expected: {m.correct_answer}
                                </p>
                              </div>
                              <span className="bg-[#FF4B4B] text-white text-xs font-black px-2.5 py-1 rounded-xl shrink-0">
                                {m.miss_count} misses ({m.miss_rate}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Authoring Forms: Create Unit & Create Skill + Bulk JSON Importer */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Create Unit & Skill Form */}
                    <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 space-y-5">
                      <h3 className="font-black text-base text-[#3C3C3C] flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-[#58CC02]" />
                        <span>Author New Skill on Current Path</span>
                      </h3>
                      <div className="space-y-3">
                        <select
                          value={newSkillForm.unit_id}
                          onChange={(e) =>
                            setNewSkillForm({ ...newSkillForm, unit_id: Number(e.target.value) })
                          }
                          className="w-full bg-slate-50 border-2 border-[#E5E5E5] rounded-2xl px-4 py-2.5 font-bold text-sm"
                        >
                          {units.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.title}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Skill Title (e.g., Past Tense Verbs)"
                          value={newSkillForm.title}
                          onChange={(e) => setNewSkillForm({ ...newSkillForm, title: e.target.value })}
                          className="w-full bg-slate-50 border-2 border-[#E5E5E5] rounded-2xl px-4 py-2.5 font-bold text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Skill Description"
                          value={newSkillForm.description}
                          onChange={(e) =>
                            setNewSkillForm({ ...newSkillForm, description: e.target.value })
                          }
                          className="w-full bg-slate-50 border-2 border-[#E5E5E5] rounded-2xl px-4 py-2.5 font-bold text-sm"
                        />
                        <button
                          onClick={async () => {
                            if (!newSkillForm.title.trim()) {
                              showNotice("Enter a skill title first!", "error");
                              return;
                            }
                            const res = await apiRequest<{ message: string }>(
                              "/api/v1/admin/skills",
                              {
                                method: "POST",
                                body: JSON.stringify({
                                  ...newSkillForm,
                                  icon_name: "star",
                                }),
                              },
                              token
                            );
                            setNewSkillForm({ ...newSkillForm, title: "", description: "" });
                            await loadCoursePath(user?.active_course.id || 1);
                            showNotice(res.message, "success");
                          }}
                          className="w-full btn-3d-green py-2.5 text-xs uppercase tracking-wider"
                        >
                          + Publish Skill to Path
                        </button>
                      </div>
                    </div>

                    {/* Bulk JSON Course Importer (P3) */}
                    <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 space-y-3">
                      <h3 className="font-black text-base text-[#3C3C3C] flex items-center gap-2">
                        <Upload className="w-5 h-5 text-[#1CB0F6]" />
                        <span>Bulk JSON/CSV Lesson Content Importer (P3)</span>
                      </h3>
                      <textarea
                        rows={6}
                        value={bulkJsonText}
                        onChange={(e) => setBulkJsonText(e.target.value)}
                        className="w-full bg-slate-900 text-emerald-300 font-mono text-xs p-3.5 rounded-2xl border-2 border-slate-700"
                      />
                      <button
                        onClick={async () => {
                          try {
                            const parsed = JSON.parse(bulkJsonText);
                            const res = await apiRequest<{ message: string }>(
                              "/api/v1/admin/bulk-import",
                              {
                                method: "POST",
                                body: JSON.stringify({
                                  course_id: user?.active_course.id || 1,
                                  unit_title: parsed.unit_title || "Imported Unit",
                                  skill_title: parsed.skill_title || "Imported Skill",
                                  exercises: parsed.exercises || [],
                                }),
                              },
                              token
                            );
                            await loadCoursePath(user?.active_course.id || 1);
                            showNotice(res.message, "success");
                          } catch (err: any) {
                            showNotice(err.message || "Invalid JSON payload", "error");
                          }
                        }}
                        className="w-full btn-3d-sky py-2.5 text-xs uppercase tracking-wider"
                      >
                        Execute Bulk Content Import
                      </button>
                    </div>
                  </div>

                  {/* User Management & Feedback Queue */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Management Table */}
                    <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 space-y-4">
                      <h3 className="font-black text-base text-[#3C3C3C]"> Learner Account Operations</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {adminUsers.map((u) => (
                          <div
                            key={u.id}
                            className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2"
                          >
                            <div>
                              <p className="font-extrabold text-xs text-[#3C3C3C]">
                                {u.display_name} ({u.xp_total} XP)
                              </p>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={async () => {
                                  await apiRequest(
                                    `/api/v1/admin/users/${u.id}/action?action=refill_hearts`,
                                    { method: "POST" },
                                    token
                                  );
                                  showNotice(`Refilled hearts for ${u.display_name}`, "success");
                                }}
                                className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-600 font-bold text-[11px]"
                              >
                                +Hearts
                              </button>
                              <button
                                onClick={async () => {
                                  await apiRequest(
                                    `/api/v1/admin/users/${u.id}/action?action=reset_progress`,
                                    { method: "POST" },
                                    token
                                  );
                                  showNotice(`Reset XP for ${u.display_name}`, "info");
                                }}
                                className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 font-bold text-[11px]"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bug & Feedback Intake Queue */}
                    <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 space-y-4">
                      <h3 className="font-black text-base text-[#3C3C3C]">
                        Learner Feedback & System Intake
                      </h3>
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {adminFeedback.map((rep) => (
                          <div
                            key={rep.id}
                            className="p-3.5 rounded-2xl border border-slate-200 flex items-start justify-between gap-3"
                          >
                            <div>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {rep.category}
                              </span>
                              <p className="font-extrabold text-xs text-[#3C3C3C] mt-1">{rep.summary}</p>
                              <p className="text-[11px] text-slate-400">{rep.user_email}</p>
                            </div>
                            <button
                              onClick={async () => {
                                await apiRequest(
                                  `/api/v1/admin/feedback/${rep.id}/resolve`,
                                  { method: "POST" },
                                  token
                                );
                                setAdminFeedback((prev) =>
                                  prev.map((r) =>
                                    r.id === rep.id
                                      ? { ...r, status: r.status === "open" ? "resolved" : "open" }
                                      : r
                                  )
                                );
                              }}
                              className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase ${rep.status === "resolved"
                                  ? "bg-emerald-100 text-[#46A302]"
                                  : "bg-amber-100 text-amber-800"
                                }`}
                            >
                              {rep.status}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-[#E5E5E5] flex items-center justify-around py-2 px-2">
            {[
              { id: "learn", icon: BookOpen, label: "Learn" },
              { id: "leaderboard", icon: Trophy, label: "League" },
              { id: "shop", icon: ShoppingBag, label: "Shop" },
              { id: "profile", icon: UserIcon, label: "Profile" },
              { id: "settings", icon: SettingsIcon, label: "Settings" },
              { id: "admin", icon: ShieldAlert, label: "Admin" },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as NavTab)}
                  className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl ${active ? "text-[#1CB0F6] font-black" : "text-slate-400 font-bold"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px]">{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ================================================================= */}
          {/* FULL-SCREEN INTERACTIVE LESSON PLAYER OVERLAY                     */}
          {/* ================================================================= */}
          {activeLesson && (
            <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between overflow-y-auto">
              {lessonSummary ? (
                /* Lesson Complete Celebration View */
                <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto px-6 py-10 text-center space-y-6">
                  <img
                    src="/logo-full-diolingo.png"
                    alt="Dio Celebrating"
                    className="w-48 h-auto animate-bounce"
                  />
                  <div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-xs uppercase tracking-widest">
                      LESSON COMPLETED!
                    </span>
                    <h2 className="text-3xl font-black text-[#58CC02] mt-2">
                      ¡Increíble! Practice Complete!
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">
                      You mastered {activeLesson.title} with {lessonSummary.accuracy}% accuracy.
                    </p>
                  </div>

                  {/* XP, Accuracy, Streak, Gems Grid */}
                  <div className="grid grid-cols-3 gap-3 w-full">
                    <div className="bg-[#FFF8DC] border-2 border-[#FFC800] rounded-2xl p-3">
                      <p className="text-[11px] font-black uppercase text-[#9A7400]">TOTAL XP</p>
                      <p className="text-2xl font-black text-[#9A7400] mt-1">
                        +{lessonSummary.xp_breakdown.total_xp}
                      </p>
                      {lessonSummary.xp_breakdown.multiplier > 1 && (
                        <span className="text-[10px] font-black bg-[#CE82FF] text-white px-1.5 py-0.5 rounded">
                          2x BOOST
                        </span>
                      )}
                    </div>
                    <div className="bg-[#E8F9DF] border-2 border-[#58CC02] rounded-2xl p-3">
                      <p className="text-[11px] font-black uppercase text-[#46A302]">ACCURACY</p>
                      <p className="text-2xl font-black text-[#46A302] mt-1">
                        {lessonSummary.accuracy}%
                      </p>
                    </div>
                    <div className="bg-orange-50 border-2 border-[#FF9600] rounded-2xl p-3">
                      <p className="text-[11px] font-black uppercase text-[#FF9600]">STREAK</p>
                      <p className="text-2xl font-black text-[#FF9600] mt-1">
                        {lessonSummary.streak.streak_count}d
                      </p>
                    </div>
                  </div>

                  {/* Newly Unlocked Achievements */}
                  {lessonSummary.newly_unlocked_achievements.length > 0 && (
                    <div className="w-full bg-amber-50 border-2 border-[#FFC800] rounded-2xl p-4 text-left space-y-2">
                      <p className="text-xs font-black uppercase text-amber-800">
                        Achievement Unlocked
                      </p>
                      {lessonSummary.newly_unlocked_achievements.map((a) => (
                        <div key={a.code} className="flex items-center gap-3">
                          <span className="text-2xl">{a.icon_emoji}</span>
                          <div>
                            <p className="font-black text-sm text-[#3C3C3C]">{a.title}</p>
                            <p className="text-xs font-semibold text-slate-600">{a.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setActiveLesson(null);
                      setLessonSummary(null);
                    }}
                    className="w-full btn-3d-green py-4 text-base uppercase tracking-wider"
                  >
                    Continue to Path
                  </button>
                </div>
              ) : (
                /* Active Exercise View */
                <>
                  {/* Lesson Top Progress Header */}
                  <div className="max-w-3xl w-full mx-auto px-4 pt-6 pb-3 flex items-center gap-4">
                    <button
                      onClick={() => setActiveLesson(null)}
                      aria-label="Exit Lesson"
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-7 h-7" />
                    </button>
                    <div className="flex-1 h-4 bg-[#E5E5E5] rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.round(
                            ((currentExIndex + (lessonFeedback?.checked ? 1 : 0)) /
                              Math.max(1, activeLesson.exercises.length)) *
                            100
                          )}%`,
                        }}
                        className="h-full bg-[#58CC02] rounded-full transition-all duration-300"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 font-black text-[#FF4B4B] text-lg">
                      <Heart className="w-6 h-6 fill-[#FF4B4B]" />
                      <span>{user?.stats.hearts ?? 5}</span>
                    </div>
                  </div>

                  {/* Exercise Content Container */}
                  {currentExercise && (
                    <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col justify-center space-y-6">
                      {/* Exercise Type Badge & Grammar Tip */}
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-50 text-[#46A302] border border-emerald-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                          Question {currentExIndex + 1} of {activeLesson.exercises.length} •{" "}
                          {currentExercise.exercise_type.replace("_", " ")}
                        </span>
                        {currentExercise.hint_text && (
                          <span className="text-xs font-bold text-slate-400">
                            Hint: {currentExercise.hint_text}
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black text-[#3C3C3C]">
                        <SplitText text={currentExercise.prompt_text} />
                      </h2>

                      {/* VoicePill Audio & Speech Cadence Bar */}
                      {(currentExercise.source_sentence || currentExercise.audio_text) && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-white/[0.08] shadow-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src="/mascot-dio.png"
                              alt="Dio instructor"
                              className="w-10 h-10 object-contain shrink-0"
                            />
                            <div>
                              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold block">
                                Native Phonetic Cadence
                              </span>
                              {currentExercise.exercise_type !== "listening" && (
                                <p className="font-medium text-base text-zinc-100">
                                  {currentExercise.source_sentence}
                                </p>
                              )}
                            </div>
                          </div>

                          <VoicePill
                            targetPhrase={currentExercise.audio_text || currentExercise.source_sentence}
                            onResult={(transcript) => {
                              if (currentExercise.exercise_type === "speaking" || currentExercise.exercise_type === "type_answer") {
                                setTypedAnswer(transcript);
                              }
                              playSoundEffect("correct", user?.sound_enabled ?? true);
                            }}
                            lang={currentExercise.audio_lang || "es"}
                            soundEnabled={user?.sound_enabled ?? true}
                          />
                        </div>
                      )}

                      {/* RENDER BY EXERCISE TYPE */}

                      {/* Type 1 & 4: Multiple Choice & Fill-in-the-Blank */}
                      {(currentExercise.exercise_type === "multiple_choice" ||
                        currentExercise.exercise_type === "fill_blank") && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {currentExercise.options.map((opt, idx) => {
                              const isSelected = selectedChoice === opt.text;
                              return (
                                <button
                                  key={opt.id || idx}
                                  type="button"
                                  disabled={lessonFeedback?.checked}
                                  onClick={() => {
                                    playSoundEffect("click", user?.sound_enabled ?? true);
                                    setSelectedChoice(opt.text);
                                    if (opt.text) {
                                      speakPhrase(opt.text, currentExercise.audio_lang, false, user?.sound_enabled ?? true);
                                    }
                                  }}
                                  className={`p-4 rounded-2xl border-2 border-b-4 text-left flex items-center justify-between transition ${isSelected
                                      ? "bg-[#DDF4FF] border-[#1CB0F6] text-[#1899D6]"
                                      : "bg-white border-[#E5E5E5] hover:bg-slate-50 text-[#3C3C3C]"
                                    }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg border-2 border-current flex items-center justify-center text-xs font-black">
                                      {idx + 1}
                                    </span>
                                    <span className="font-extrabold text-base">{opt.text}</span>
                                  </div>

                                </button>
                              );
                            })}
                          </div>
                        )}

                      {/* Type 2 & 6: Word Bank & Listening ("Tap the words") */}
                      {(currentExercise.exercise_type === "word_bank" ||
                        currentExercise.exercise_type === "listening") && (
                          <div className="space-y-6">
                            {/* Assembled Sentence Tray */}
                            <div className="min-h-[68px] p-3 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-wrap items-center gap-2">
                              {selectedWords.length === 0 ? (
                                <span className="text-sm font-bold text-slate-400 px-2">
                                  Tap the words below to assemble your translation...
                                </span>
                              ) : (
                                selectedWords.map((item, idx) => (
                                  <button
                                    key={`${item.idx}-${idx}`}
                                    type="button"
                                    disabled={lessonFeedback?.checked}
                                    onClick={() =>
                                      setSelectedWords((prev) => prev.filter((_, i) => i !== idx))
                                    }
                                    className="btn-3d-white px-3.5 py-2 text-sm"
                                  >
                                    {item.text}
                                  </button>
                                ))
                              )}
                            </div>

                            {/* Available Word Pills */}
                            <div className="flex flex-wrap gap-2.5 justify-center">
                              {currentExercise.options.map((opt, idx) => {
                                const alreadyPicked = selectedWords.some((w) => w.idx === idx);
                                return (
                                  <button
                                    key={opt.id || idx}
                                    type="button"
                                    disabled={alreadyPicked || lessonFeedback?.checked}
                                    onClick={() => {
                                      playSoundEffect("click", user?.sound_enabled ?? true);
                                      setSelectedWords((prev) => [...prev, { idx, text: opt.text }]);
                                    }}
                                    className={`px-4 py-2.5 rounded-2xl text-sm font-extrabold transition ${alreadyPicked
                                        ? "bg-slate-200 text-transparent border-2 border-slate-200 cursor-default select-none"
                                        : "btn-3d-white"
                                      }`}
                                  >
                                    {opt.text}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      {/* Type 3: Match Pairs Grid */}
                      {currentExercise.exercise_type === "match_pairs" && (
                        <div className="grid grid-cols-2 gap-4">
                          {/* Left Column (Spanish) */}
                          <div className="space-y-2.5">
                            {currentExercise.options.map((opt) => {
                              const isMatched = matchedPairs.includes(opt.text);
                              const isSelected = selectedLeftTile === opt.text;
                              return (
                                <button
                                  key={opt.text}
                                  type="button"
                                  disabled={isMatched}
                                  onClick={() => handlePairTap("left", opt.text)}
                                  className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm border-2 border-b-4 transition ${isMatched
                                      ? "bg-[#E8F9DF] border-[#58CC02] text-[#46A302] opacity-60"
                                      : isSelected
                                        ? mismatchPair
                                          ? "bg-rose-100 border-[#FF4B4B] text-[#FF4B4B]"
                                          : "bg-[#DDF4FF] border-[#1CB0F6] text-[#1899D6]"
                                        : "bg-white border-[#E5E5E5] hover:bg-slate-50"
                                    }`}
                                >
                                  {opt.text}
                                </button>
                              );
                            })}
                          </div>

                          {/* Right Column (English Shuffled) */}
                          <div className="space-y-2.5">
                            {shuffledRightMatches.map((pair) => {
                              const isMatched = matchedPairs.includes(pair.left);
                              const isSelected = selectedRightTile === pair.right;
                              return (
                                <button
                                  key={pair.right}
                                  type="button"
                                  disabled={isMatched}
                                  onClick={() => handlePairTap("right", pair.right)}
                                  className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm border-2 border-b-4 transition ${isMatched
                                      ? "bg-[#E8F9DF] border-[#58CC02] text-[#46A302] opacity-60"
                                      : isSelected
                                        ? mismatchPair
                                          ? "bg-rose-100 border-[#FF4B4B] text-[#FF4B4B]"
                                          : "bg-[#DDF4FF] border-[#1CB0F6] text-[#1899D6]"
                                        : "bg-white border-[#E5E5E5] hover:bg-slate-50"
                                    }`}
                                >
                                  {pair.right}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Type 5 & 7: Type-the-Answer & Speaking */}
                      {(currentExercise.exercise_type === "type_answer" ||
                        currentExercise.exercise_type === "speaking") && (
                          <div className="space-y-4">
                            {currentExercise.exercise_type === "speaking" && (
                              <div className="space-y-3">
                                <VoicePill
                                  targetPhrase={currentExercise.correct_answer.split("|")[0]}
                                  onResult={(transcript) => {
                                    setTypedAnswer(transcript);
                                    playSoundEffect("correct", user?.sound_enabled ?? true);
                                  }}
                                />
                                <div className="flex flex-wrap items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const primary = currentExercise.correct_answer.split("|")[0];
                                      setTypedAnswer(primary);
                                      playSoundEffect("correct", user?.sound_enabled ?? true);
                                    }}
                                    className="btn-3d-sky px-5 py-3 text-sm flex items-center gap-2"
                                  >
                                    <Mic className="w-5 h-5" />
                                    <span>Tap to Speak / Simulate Voice Input</span>
                                  </button>
                                  <span className="text-xs font-bold text-slate-400">
                                    (Or type the phrase below if microphone is unavailable)
                                  </span>
                                </div>
                              </div>
                            )}

                            <textarea
                              rows={3}
                              disabled={lessonFeedback?.checked}
                              value={typedAnswer}
                              onChange={(e) => setTypedAnswer(e.target.value)}
                              placeholder="Type your answer here (fuzzy typo tolerance active!)..."
                              className="w-full bg-slate-50 border-2 border-[#E5E5E5] focus:border-[#1CB0F6] focus:bg-white rounded-2xl p-4 font-extrabold text-base focus:outline-none"
                            />

                            {/* Spanish Accent Character Bar */}
                            <div className="flex flex-wrap gap-1.5">
                              {["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"].map((ch) => (
                                <button
                                  key={ch}
                                  type="button"
                                  disabled={lessonFeedback?.checked}
                                  onClick={() => setTypedAnswer((prev) => prev + ch)}
                                  className="btn-3d-white px-3 py-1 text-sm"
                                >
                                  {ch}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Bottom Lesson Action & Immediate Feedback Bar */}
                  <div
                    className={`border-t-2 transition-colors ${lessonFeedback?.checked
                        ? lessonFeedback.is_correct
                          ? "bg-[#D7FFB8] border-[#58CC02]"
                          : "bg-[#FFDFE0] border-[#FF4B4B]"
                        : "bg-white border-[#E5E5E5]"
                      }`}
                  >
                    <div className="max-w-3xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {lessonFeedback?.checked ? (
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${lessonFeedback.is_correct
                                ? "bg-[#58CC02] text-white"
                                : "bg-[#FF4B4B] text-white"
                              }`}
                          >
                            {lessonFeedback.is_correct ? (
                              <Check className="w-6 h-6 stroke-[3]" />
                            ) : (
                              <X className="w-6 h-6 stroke-[3]" />
                            )}
                          </div>
                          <div>
                            <h4
                              className={`font-black text-lg ${lessonFeedback.is_correct ? "text-[#46A302]" : "text-[#EA2B2B]"
                                }`}
                            >
                              {lessonFeedback.is_correct
                                ? lessonFeedback.has_typo
                                  ? "Accepted with tiny typo!"
                                  : "¡Excelente! Nicely done!"
                                : "Not quite right"}
                            </h4>
                            <p className="text-sm font-extrabold text-[#3C3C3C]">
                              {lessonFeedback.message}
                            </p>
                            {lessonFeedback.explanation && (
                              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                                {lessonFeedback.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentExercise) return;
                            const primary = currentExercise.correct_answer.split("|")[0];
                            if (
                              currentExercise.exercise_type === "multiple_choice" ||
                              currentExercise.exercise_type === "fill_blank"
                            ) {
                              setSelectedChoice(primary);
                            } else if (
                              currentExercise.exercise_type === "word_bank" ||
                              currentExercise.exercise_type === "listening"
                            ) {
                              const correctOpts = currentExercise.options
                                .map((o, idx) => ({ idx, text: o.text }))
                                .slice(0, primary.split(" ").length);
                              setSelectedWords(correctOpts);
                            } else if (currentExercise.exercise_type === "match_pairs") {
                              setMatchedPairs(currentExercise.options.map((o) => o.text));
                            } else {
                              setTypedAnswer(primary);
                            }
                          }}
                          className="text-xs font-extrabold text-slate-400 hover:text-[#1CB0F6] self-start sm:self-center"
                        >
                          Demo Helper: Auto-Fill Correct Answer
                        </button>
                      )}

                      {lessonFeedback?.checked ? (
                        <button
                          type="button"
                          onClick={handleContinueLesson}
                          className={`px-8 py-3.5 text-sm uppercase tracking-wider shrink-0 ${lessonFeedback.is_correct ? "btn-3d-green" : "btn-3d-coral"
                            }`}
                        >
                          CONTINUE
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCheckAnswer}
                          className="btn-3d-green px-8 py-3.5 text-sm uppercase tracking-wider shrink-0"
                        >
                          CHECK ANSWER
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Out of Hearts Modal Mid-Lesson */}
              {outOfHeartsModal && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-5 border-b-4 border-slate-300">
                    <div className="w-20 h-20 rounded-full bg-rose-100 text-[#FF4B4B] flex items-center justify-center mx-auto">
                      <Heart className="w-11 h-11 fill-current" />
                    </div>
                    <h3 className="text-2xl font-black text-[#3C3C3C]">You ran out of Hearts!</h3>
                    <p className="text-sm font-semibold text-slate-500">
                      Refill your hearts with a quick practice session or spend 50 Gems to keep your lesson progress!
                    </p>
                    <div className="space-y-2.5">
                      <button
                        onClick={() => handlePracticeRefill(false)}
                        className="w-full btn-3d-sky py-3.5 text-sm uppercase tracking-wider"
                      >
                        Practice to Refill (+1 Heart — Free)
                      </button>
                      <button
                        onClick={() => handlePracticeRefill(true)}
                        className="w-full btn-3d-green py-3 text-sm uppercase tracking-wider"
                      >
                        Instant Full Refill (5 Hearts)
                      </button>
                      <button
                        onClick={() => {
                          setOutOfHeartsModal(false);
                          setActiveLesson(null);
                        }}
                        className="w-full py-2 text-xs font-extrabold text-slate-400 hover:text-rose-600"
                      >
                        Quit Lesson for Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* UNIT GRAMMAR GUIDEBOOK MODAL                                      */}
          {/* ================================================================= */}
          {guidebookUnit && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border-2 border-[#E5E5E5] shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/mascot-dio.png" alt="Dio Guide" className="w-12 h-12 object-contain" />
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#58CC02]">
                        UNIT GUIDEBOOK & GRAMMAR TIPS
                      </span>
                      <h3 className="text-xl font-black text-[#3C3C3C]">{guidebookUnit.grammar_tip_title}</h3>
                    </div>
                  </div>
                  <button onClick={() => setGuidebookUnit(null)}>
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-sm font-semibold text-slate-700 whitespace-pre-line leading-relaxed">
                  {guidebookUnit.grammar_tip_markdown}
                </div>
                <button
                  onClick={() => setGuidebookUnit(null)}
                  className="w-full btn-3d-green py-3 text-sm uppercase tracking-wider"
                >
                  Got It, Let&apos;s Practice!
                </button>
              </div>
            </div>
          )}



          {/* ================================================================= */}
          {/* SUPER DIOLINGO SUBSCRIPTION PAYWALL PREVIEW MODAL (P3)            */}
          {/* ================================================================= */}
          {showSuperModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4C1D95] text-white rounded-3xl max-w-md w-full p-6 text-center space-y-5 border-2 border-indigo-400">
                <div className="flex justify-end">
                  <button onClick={() => setShowSuperModal(false)}>
                    <X className="w-6 h-6 text-indigo-200" />
                  </button>
                </div>
                <img src="/mascot-dio.png" alt="Super Dio" className="w-28 h-28 mx-auto object-contain" />
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest">
                  COMING SOON — EDUCATIONAL PREVIEW
                </span>
                <h3 className="text-2xl font-black">Super Diolingo</h3>
                <ul className="text-left text-sm font-bold space-y-2 bg-white/10 p-4 rounded-2xl">
                  <li>️ Unlimited Hearts — never get interrupted by mistakes</li>
                  <li> Free access to all Legendary Boss Challenges</li>
                  <li> Personalized Mistake Practice Inbox</li>
                  <li> Zero third-party ads or billing — 100% educational</li>
                </ul>
                <button
                  onClick={() => {
                    setShowSuperModal(false);
                    showNotice("Super Diolingo is a non-commercial educational preview!", "info");
                  }}
                  className="w-full btn-3d-gold py-3.5 text-sm uppercase tracking-wider"
                >
                  Close Preview (No Payment Required)
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SHARE LEADERBOARD RESULT CARD MODAL (P3)                          */}
          {/* ================================================================= */}
          {showShareCardModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 border-2 border-[#E5E5E5]">
                <div className="bg-gradient-to-br from-[#E8F9DF] to-[#DDF4FF] rounded-2xl p-6 border-2 border-[#58CC02] space-y-3">
                  <img
                    src="/logo-full-diolingo.png"
                    alt="Diolingo Share Card"
                    className="w-36 h-auto mx-auto"
                  />
                  <h4 className="text-xl font-black text-[#3C3C3C]">{user?.display_name}</h4>
                  <p className="text-sm font-extrabold text-[#46A302]">
                    {lbTier} League •  {user?.stats.xp_total} Total XP •  {user?.stats.streak_count}-Day Streak
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `I'm competing in the ${lbTier} League on Diolingo with ${user?.stats.xp_total} XP and a ${user?.stats.streak_count}-day streak! `
                      );
                      showNotice("Copied share summary to clipboard!", "success");
                      setShowShareCardModal(false);
                    }}
                    className="flex-1 btn-3d-green py-3 text-xs uppercase tracking-wider"
                  >
                    Copy Summary Text
                  </button>
                  <button
                    onClick={() => setShowShareCardModal(false)}
                    className="btn-3d-white px-4 py-3 text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ================================================================= */}
      {/* GLOBAL MODALS — rendered at root level so accessible from any view */}
      {/* ================================================================= */}

      {/* 60+ WORLD LANGUAGES COURSE PICKER MODAL */}
      <CoursePickerModal
        isOpen={showCoursePicker}
        onClose={() => setShowCoursePicker(false)}
        courses={courses}
        activeCourseId={user?.active_course?.id || 1}
        onSelectCourse={(course) => handleCourseChange(course.id)}
      />

      {/* AUTH & ONBOARDING MODAL — accessible from landing page login/signup buttons */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={onboardingAuthMode}
        onAuthSuccess={async (newToken, newUser) => {
          const effectiveUser = newUser || (FALLBACK_USER as any);
          setToken(newToken);
          setUser(effectiveUser);
          setTopViewMode("dashboard");
          const targetCourseId = effectiveUser?.active_course?.id || 1;
          await loadCoursePath(targetCourseId, newToken);
          showNotice(`Welcome, ${effectiveUser.display_name}!`, "success");
        }}
      />
    </div>
  );
}

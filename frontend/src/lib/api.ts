/**
 * Typed REST API Client for Diolingo Backend (`http://localhost:8000/api/v1`)
 *
 * API_BASE_URL is intentionally empty — all requests use relative paths like
 * /api/v1/... which are proxied by Next.js rewrites to the actual backend.
 * This eliminates CORS permanently regardless of where the frontend is hosted.
 */

export const API_BASE_URL = "";


export interface UserStats {
  xp_total: number;
  xp_today: number;
  streak_count: number;
  longest_streak: number;
  last_active_date: string | null;
  hearts: number;
  max_hearts: number;
  seconds_until_next_heart: number;
  gems: number;
  streak_freeze_equipped: boolean;
  xp_boost_active: boolean;
  xp_boost_seconds_remaining: number;
  league_tier: string;
  lessons_completed_count: number;
  perfect_lessons_count: number;
  total_crowns: number;
}

export interface AchievementItem {
  id: number;
  code: string;
  title: string;
  description: string;
  icon_emoji: string;
  target_value: number;
  current_value: number;
  gem_reward: number;
  unlocked: boolean;
  unlocked_at?: string | null;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string;
  equipped_outfit: string;
  role: "learner" | "admin";
  is_guest: boolean;
  daily_xp_goal: number;
  sound_enabled: boolean;
  speaking_enabled: boolean;
  listening_enabled: boolean;
  notifications_enabled: boolean;
  created_at: string;
  active_course: {
    id: number;
    slug: string;
    title: string;
    flag_emoji: string;
    target_language: string;
  };
  stats: UserStats;
  achievements: AchievementItem[];
  inventory: string[];
  following_count: number;
  followers_count: number;
}

export interface SkillNode {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon_name: string;
  order_index: number;
  is_checkpoint: boolean;
  is_bonus_legendary: boolean;
  crowns: number;
  max_crowns: number;
  state: "locked" | "available" | "active" | "completed" | "legendary";
  grammar_tip: string;
  lesson_id: number | null;
  xp_reward: number;
  is_unlocked?: boolean;
}

export interface UnitSection {
  id: number;
  order_index: number;
  title: string;
  description: string;
  theme_color: string;
  grammar_tip_title: string;
  grammar_tip_markdown: string;
  is_unlocked?: boolean;
  skills: SkillNode[];
}

export interface ExerciseOptionItem {
  id: number;
  text: string;
  match: string;
  emoji: string;
}

export interface ExerciseItem {
  id: number;
  order_index: number;
  exercise_type:
    | "multiple_choice"
    | "word_bank"
    | "match_pairs"
    | "fill_blank"
    | "type_answer"
    | "listening"
    | "speaking";
  difficulty: number;
  prompt_text: string;
  source_sentence: string;
  correct_answer: string;
  hint_text: string;
  audio_text: string;
  audio_lang: string;
  explanation: string;
  options: ExerciseOptionItem[];
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    throw new Error("Cannot reach the server. Please check your connection.");
  }

  // Safely parse — some error responses return plain text, not JSON
  let data: any;
  const contentType = res.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      // Attempt JSON parse anyway (some servers omit content-type)
      try { data = JSON.parse(text); } catch { data = { detail: text || res.statusText }; }
    }
  } catch {
    data = { detail: res.statusText || "Unknown error" };
  }

  if (!res.ok) {
    const errMessage =
      data?.error?.message ||
      data?.detail ||
      `Request failed with status ${res.status}`;
    throw new Error(errMessage);
  }
  return data as T;
}


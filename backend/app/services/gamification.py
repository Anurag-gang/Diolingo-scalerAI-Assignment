"""Core Gamification, Lesson Validation, Heart Regen, and Streak Engine.

All business logic is executed server-side with an injectable clock (`current_date` / `now_dt`)
so that unit tests and mobile clients have 100% deterministic parity.
"""
import re
import unicodedata
from datetime import date, datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from ..models import (
    Achievement,
    Exercise,
    ExerciseMissStat,
    Lesson,
    LessonAttempt,
    Skill,
    User,
    UserAchievement,
    UserSkillProgress,
    UserStats,
)

HEART_REGEN_SECONDS = 4 * 3600  # +1 Heart every 4 hours


def normalize_text(value: str) -> str:
    """Lowercase, strip punctuation, collapse spaces, and normalize accents."""
    if not value:
        return ""
    # Strip accents/diacritics for base comparison
    nfkd = unicodedata.normalize("NFKD", value.strip().lower())
    without_accents = "".join(c for c in nfkd if not unicodedata.combining(c))
    # Remove punctuation
    cleaned = re.sub(r"[^\w\s]", "", without_accents)
    return re.sub(r"\s+", " ", cleaned).strip()


def levenshtein_distance(a: str, b: str) -> int:
    """Compute character-level Levenshtein edit distance between two strings."""
    if a == b:
        return 0
    if len(a) < len(b):
        return levenshtein_distance(b, a)
    if len(b) == 0:
        return len(a)

    previous_row = list(range(len(b) + 1))
    for i, c1 in enumerate(a):
        current_row = [i + 1]
        for j, c2 in enumerate(b):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


def evaluate_answer(
    exercise_type: str,
    submitted_answer: str,
    correct_answer: str,
) -> Tuple[bool, bool, str]:
    """Evaluate a learner's answer.

    Returns:
        (is_correct, has_typo, feedback_message)
    """
    if exercise_type == "match_pairs":
        # Match pairs are validated on the client tile-by-tile and submitted as "MATCHED_ALL"
        is_ok = submitted_answer.strip().upper() == "MATCHED_ALL" or normalize_text(submitted_answer) == normalize_text(correct_answer)
        return (is_ok, False, "Awesome matching!" if is_ok else f"Correct pairs: {correct_answer}")

    norm_sub = normalize_text(submitted_answer)
    # Support multiple valid translations separated by '|'
    acceptable_variants = [v.strip() for v in correct_answer.split("|") if v.strip()]
    norm_variants = [normalize_text(v) for v in acceptable_variants]

    if not norm_sub:
        return (False, False, f"Correct solution: {acceptable_variants[0]}")

    # Exact normalized match
    if norm_sub in norm_variants:
        # Check if user missed accents compared to canonical answer
        exact_raw = any(submitted_answer.strip().lower() == v.lower() for v in acceptable_variants)
        if not exact_raw and exercise_type in ("type_answer", "fill_blank"):
            return (True, False, f"Nicely done! Pay attention to accents: {acceptable_variants[0]}")
        return (True, False, "Excellent!")

    # Fuzzy / typo tolerance for free-text exercises (type_answer, listening, speaking)
    if exercise_type in ("type_answer", "listening", "speaking"):
        for raw_v, norm_v in zip(acceptable_variants, norm_variants):
            dist = levenshtein_distance(norm_sub, norm_v)
            max_allowed = 1 if len(norm_v) >= 5 else 0
            if len(norm_v) >= 14:
                max_allowed = 2
            if 0 < dist <= max_allowed:
                return (True, True, f"Almost exact! Watch out for a small typo: \"{raw_v}\"")

    return (False, False, f"Correct solution: {acceptable_variants[0]}")


def sync_hearts(stats: UserStats, now_dt: Optional[datetime] = None) -> Dict[str, Any]:
    """Synchronize regenerated hearts based on elapsed time since last update."""
    now = now_dt or datetime.utcnow()
    if stats.hearts >= stats.max_hearts:
        stats.hearts = stats.max_hearts
        stats.hearts_updated_at = now
        return {"hearts": stats.hearts, "max_hearts": stats.max_hearts, "seconds_until_next_heart": 0}

    last_update = stats.hearts_updated_at or now
    elapsed_seconds = max(0.0, (now - last_update).total_seconds())
    regenerated = int(elapsed_seconds // HEART_REGEN_SECONDS)

    if regenerated > 0:
        stats.hearts = min(stats.max_hearts, stats.hearts + regenerated)
        if stats.hearts >= stats.max_hearts:
            stats.hearts_updated_at = now
            return {"hearts": stats.hearts, "max_hearts": stats.max_hearts, "seconds_until_next_heart": 0}
        else:
            stats.hearts_updated_at = last_update + timedelta(seconds=regenerated * HEART_REGEN_SECONDS)

    remaining_elapsed = max(0.0, (now - stats.hearts_updated_at).total_seconds())
    seconds_left = max(1, int(HEART_REGEN_SECONDS - remaining_elapsed))
    return {
        "hearts": stats.hearts,
        "max_hearts": stats.max_hearts,
        "seconds_until_next_heart": seconds_left,
    }


def apply_wrong_answer_heart_loss(stats: UserStats, now_dt: Optional[datetime] = None) -> Dict[str, Any]:
    """Decrement 1 heart on wrong answer and start the regeneration clock if needed."""
    now = now_dt or datetime.utcnow()
    sync_hearts(stats, now_dt=now)
    if stats.hearts == stats.max_hearts:
        stats.hearts_updated_at = now
    stats.hearts = max(0, stats.hearts - 1)
    return sync_hearts(stats, now_dt=now)


def update_streak_for_activity(
    stats: UserStats,
    current_date: Optional[date] = None,
) -> Dict[str, Any]:
    """Update streak counter using injectable calendar date (`current_date`).

    Rules:
    - First ever activity: streak becomes 1.
    - Activity on same calendar day (`last_active_date == today`): streak unchanged (idempotent).
    - Activity on consecutive calendar day (`last_active_date == today - 1 day`): streak increments by 1.
    - Activity after 1 missed day (`last_active_date == today - 2 days`) WITH `streak_freeze_equipped`:
      consumes Streak Freeze, preserves streak, and increments by 1!
    - Activity after missed day(s) without freeze: resets streak to 1, `xp_today` reset for new day.
    """
    today = current_date or datetime.utcnow().date()
    freeze_used = False
    streak_incremented = False

    if stats.last_active_date is None:
        stats.streak_count = 1
        stats.xp_today = 0
        streak_incremented = True
    elif stats.last_active_date == today:
        # Already active today: keep streak and xp_today intact
        streak_incremented = False
    else:
        delta_days = (today - stats.last_active_date).days
        stats.xp_today = 0  # New calendar day resets daily XP ring
        if delta_days == 1:
            stats.streak_count += 1
            streak_incremented = True
        elif delta_days == 2 and stats.streak_freeze_equipped:
            # Streak Freeze saves a single missed day!
            stats.streak_freeze_equipped = False
            stats.streak_count += 1
            freeze_used = True
            streak_incremented = True
        else:
            stats.streak_count = 1
            streak_incremented = True

    stats.last_active_date = today
    if stats.streak_count > stats.longest_streak:
        stats.longest_streak = stats.streak_count

    return {
        "streak_count": stats.streak_count,
        "longest_streak": stats.longest_streak,
        "streak_incremented": streak_incremented,
        "freeze_used": freeze_used,
        "last_active_date": stats.last_active_date.isoformat(),
    }


def calculate_lesson_xp(
    base_xp: int,
    accuracy: float,
    is_legendary: bool,
    xp_boost_until: Optional[datetime],
    now_dt: Optional[datetime] = None,
) -> Dict[str, int]:
    """Calculate total XP and Gems earned for a completed lesson."""
    now = now_dt or datetime.utcnow()
    accuracy_bonus = 5 if accuracy >= 95.0 else (2 if accuracy >= 80.0 else 0)
    legendary_bonus = 15 if is_legendary else 0
    subtotal = base_xp + accuracy_bonus + legendary_bonus

    boost_active = bool(xp_boost_until and xp_boost_until > now)
    multiplier = 2 if boost_active else 1
    total_xp = subtotal * multiplier
    gems_earned = 15 if accuracy >= 95.0 else 10

    return {
        "base_xp": base_xp,
        "accuracy_bonus": accuracy_bonus,
        "legendary_bonus": legendary_bonus,
        "multiplier": multiplier,
        "total_xp": total_xp,
        "gems_earned": gems_earned,
    }


def check_and_unlock_achievements(db: Session, user: User, stats: UserStats) -> List[Dict[str, Any]]:
    """Check rule-based achievement triggers and unlock any newly earned badges."""
    all_achievements = db.query(Achievement).all()
    existing_ids = {ua.achievement_id for ua in user.achievements}
    total_crowns = sum(p.crowns for p in user.skill_progress)

    newly_unlocked = []
    for ach in all_achievements:
        if ach.id in existing_ids:
            continue
        qualifies = False
        if ach.code == "first_lesson" and stats.lessons_completed_count >= 1:
            qualifies = True
        elif ach.code == "streak_3" and stats.streak_count >= 3:
            qualifies = True
        elif ach.code == "streak_7" and stats.streak_count >= 7:
            qualifies = True
        elif ach.code == "perfect_lesson" and stats.perfect_lessons_count >= 1:
            qualifies = True
        elif ach.code == "xp_500" and stats.xp_total >= 500:
            qualifies = True
        elif ach.code == "crown_collector" and total_crowns >= 5:
            qualifies = True

        if qualifies:
            ua = UserAchievement(user_id=user.id, achievement_id=ach.id)
            db.add(ua)
            stats.gems += ach.gem_reward
            newly_unlocked.append({
                "code": ach.code,
                "title": ach.title,
                "description": ach.description,
                "icon_emoji": ach.icon_emoji,
                "gem_reward": ach.gem_reward,
            })

    return newly_unlocked

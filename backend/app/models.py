"""Normalized Relational SQLAlchemy 2.0 ORM Models for Diolingo."""
from datetime import datetime, date
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from .database import Base


class Follow(Base):
    __tablename__ = "follows"
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    followed_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("follower_id", "followed_id", name="uq_follower_followed"),
    )


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(64), unique=True, index=True, nullable=False)
    display_name = Column(String(120), nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(255), default="/mascot-dio.png")
    equipped_outfit = Column(String(64), default="classic")
    role = Column(String(32), default="learner", nullable=False)  # "learner" | "admin"
    is_active = Column(Boolean, default=True, nullable=False)
    is_guest = Column(Boolean, default=False, nullable=False)
    active_course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    daily_xp_goal = Column(Integer, default=20, nullable=False)  # 10, 20, 30, 50
    sound_enabled = Column(Boolean, default=True, nullable=False)
    speaking_enabled = Column(Boolean, default=True, nullable=False)
    listening_enabled = Column(Boolean, default=True, nullable=False)
    notifications_enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    stats = relationship("UserStats", back_populates="user", uselist=False, cascade="all, delete-orphan")
    skill_progress = relationship("UserSkillProgress", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    inventory = relationship("UserInventory", back_populates="user", cascade="all, delete-orphan")


class UserStats(Base):
    __tablename__ = "user_stats"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    xp_total = Column(Integer, default=0, nullable=False, index=True)
    xp_today = Column(Integer, default=0, nullable=False)
    streak_count = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_active_date = Column(Date, nullable=True)
    hearts = Column(Integer, default=5, nullable=False)
    max_hearts = Column(Integer, default=5, nullable=False)
    hearts_updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    gems = Column(Integer, default=200, nullable=False)
    streak_freeze_equipped = Column(Boolean, default=False, nullable=False)
    xp_boost_until = Column(DateTime, nullable=True)
    league_tier = Column(String(32), default="Silver", nullable=False, index=True)  # Bronze, Silver, Gold
    lessons_completed_count = Column(Integer, default=0, nullable=False)
    perfect_lessons_count = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="stats")


class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(32), nullable=False, index=True)  # "google" | "apple"
    provider_user_id = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")

    __table_args__ = (
        UniqueConstraint("provider", "provider_user_id", name="uq_provider_user_id"),
    )


class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(120), nullable=False)
    source_language = Column(String(16), default="en", nullable=False)
    target_language = Column(String(16), default="es", nullable=False)
    flag_emoji = Column(String(16), default="🇪🇸", nullable=False)
    description = Column(Text, default="", nullable=False)
    locale_code = Column(String(32), default="es-ES", nullable=False)
    native_name = Column(String(120), default="Español", nullable=False)
    learner_name = Column(String(120), default="Spanish", nullable=False)
    language_family = Column(String(64), default="Romance", nullable=False)
    flag_asset = Column(String(255), default="/flags/es.svg", nullable=False)

    units = relationship("Unit", back_populates="course", order_by="Unit.order_index", cascade="all, delete-orphan")


class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, default=1, nullable=False)
    title = Column(String(160), nullable=False)
    description = Column(Text, default="", nullable=False)
    theme_color = Column(String(32), default="emerald", nullable=False)  # emerald, sky, amber, purple, rose
    grammar_tip_title = Column(String(180), default="", nullable=False)
    grammar_tip_markdown = Column(Text, default="", nullable=False)

    course = relationship("Course", back_populates="units")
    skills = relationship("Skill", back_populates="unit", order_by="Skill.order_index", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, default=1, nullable=False)
    slug = Column(String(80), nullable=False)
    title = Column(String(160), nullable=False)
    description = Column(Text, default="", nullable=False)
    icon_name = Column(String(64), default="star", nullable=False)
    is_checkpoint = Column(Boolean, default=False, nullable=False)
    is_bonus_legendary = Column(Boolean, default=False, nullable=False)
    max_crowns = Column(Integer, default=3, nullable=False)
    grammar_tip = Column(Text, default="", nullable=False)

    unit = relationship("Unit", back_populates="skills")
    lessons = relationship("Lesson", back_populates="skill", order_by="Lesson.order_index", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, default=1, nullable=False)
    title = Column(String(160), nullable=False)
    xp_reward = Column(Integer, default=15, nullable=False)
    is_legendary = Column(Boolean, default=False, nullable=False)
    heart_limit = Column(Integer, default=5, nullable=False)

    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson", order_by="Exercise.order_index", cascade="all, delete-orphan")


class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, default=1, nullable=False)
    exercise_type = Column(String(48), nullable=False)
    # Supported: multiple_choice, word_bank, match_pairs, fill_blank, type_answer, listening, speaking
    difficulty = Column(Integer, default=1, nullable=False)  # 1, 2, 3
    prompt_text = Column(Text, nullable=False)
    source_sentence = Column(Text, default="", nullable=False)
    correct_answer = Column(Text, nullable=False)
    hint_text = Column(Text, default="", nullable=False)
    audio_text = Column(Text, default="", nullable=False)
    audio_lang = Column(String(16), default="es-ES", nullable=False)
    explanation = Column(Text, default="", nullable=False)

    lesson = relationship("Lesson", back_populates="exercises")
    options = relationship("ExerciseOption", back_populates="exercise", order_by="ExerciseOption.order_index", cascade="all, delete-orphan")


class ExerciseOption(Base):
    __tablename__ = "exercise_options"
    id = Column(Integer, primary_key=True, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, default=1, nullable=False)
    option_text = Column(String(255), nullable=False)
    match_pair_text = Column(String(255), default="", nullable=False)  # Used when exercise_type == 'match_pairs'
    image_emoji = Column(String(32), default="", nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)

    exercise = relationship("Exercise", back_populates="options")


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    crowns = Column(Integer, default=0, nullable=False)
    lessons_completed = Column(Integer, default=0, nullable=False)
    legendary_completed = Column(Boolean, default=False, nullable=False)
    status = Column(String(32), default="not_started", nullable=False)  # not_started, in_progress, completed
    best_score = Column(Float, default=0.0, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="skill_progress")

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
    )


class LessonAttempt(Base):
    __tablename__ = "lesson_attempts"
    id = Column(Integer, primary_key=True, index=True)
    idempotency_key = Column(String(128), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    xp_earned = Column(Integer, default=0, nullable=False)
    gems_earned = Column(Integer, default=0, nullable=False)
    accuracy = Column(Float, default=100.0, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ExerciseMissStat(Base):
    __tablename__ = "exercise_miss_stats"
    id = Column(Integer, primary_key=True, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    miss_count = Column(Integer, default=0, nullable=False)
    attempt_count = Column(Integer, default=0, nullable=False)


class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(64), unique=True, nullable=False)
    title = Column(String(120), nullable=False)
    description = Column(String(255), nullable=False)
    icon_emoji = Column(String(32), default="🏆", nullable=False)
    target_value = Column(Integer, default=1, nullable=False)
    gem_reward = Column(Integer, default=25, nullable=False)


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")

    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )


class ShopItem(Base):
    __tablename__ = "shop_items"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(64), unique=True, nullable=False)
    name = Column(String(120), nullable=False)
    category = Column(String(48), nullable=False)  # powerup | outfit
    description = Column(String(255), nullable=False)
    price_gems = Column(Integer, nullable=False)
    icon_emoji = Column(String(32), default="💎", nullable=False)


class UserInventory(Base):
    __tablename__ = "user_inventory"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_code = Column(String(64), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    purchased_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="inventory")


class FeedbackReport(Base):
    __tablename__ = "feedback_reports"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), nullable=False)
    category = Column(String(64), default="bug", nullable=False)  # bug | content | suggestion
    summary = Column(String(255), nullable=False)
    details = Column(Text, default="", nullable=False)
    status = Column(String(32), default="open", nullable=False)  # open | resolved
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

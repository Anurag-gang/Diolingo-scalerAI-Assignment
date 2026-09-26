"""Automated Test Suite for Diolingo Gamification Core & API Integration.

Covers Section V Requirements:
1. Streak day-boundary logic (injectable current_date, consecutive days, missed days, Streak Freeze)
2. Heart depletion & 4-hour regeneration math
3. XP calculation & 2x XP Boost multiplier stacking
4. Fuzzy Levenshtein typo-tolerant answer validation
5. Transactional & idempotent lesson completion API endpoint
"""
from datetime import date, datetime, timedelta
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.models import UserStats
from app.services.gamification import (
    apply_wrong_answer_heart_loss,
    calculate_lesson_xp,
    evaluate_answer,
    sync_hearts,
    update_streak_for_activity,
)


def test_streak_day_boundary_logic():
    stats = UserStats(streak_count=0, longest_streak=0, last_active_date=None, streak_freeze_equipped=False)
    day_1 = date(2026, 9, 20)

    # 1. First ever activity
    res1 = update_streak_for_activity(stats, current_date=day_1)
    assert res1["streak_count"] == 1
    assert res1["streak_incremented"] is True

    # 2. Same calendar day activity -> idempotent (no double increment)
    res_same = update_streak_for_activity(stats, current_date=day_1)
    assert res_same["streak_count"] == 1
    assert res_same["streak_incremented"] is False

    # 3. Next consecutive calendar day -> increments to 2
    day_2 = date(2026, 9, 21)
    res2 = update_streak_for_activity(stats, current_date=day_2)
    assert res2["streak_count"] == 2
    assert res2["streak_incremented"] is True

    # 4. Missed 1 calendar day WITH Streak Freeze equipped -> preserves & increments to 3
    stats.streak_freeze_equipped = True
    day_4 = date(2026, 9, 23)  # Skipped Sept 22
    res_freeze = update_streak_for_activity(stats, current_date=day_4)
    assert res_freeze["streak_count"] == 3
    assert res_freeze["freeze_used"] is True
    assert stats.streak_freeze_equipped is False

    # 5. Missed multiple days WITHOUT Streak Freeze -> resets to 1
    day_10 = date(2026, 9, 29)
    res_reset = update_streak_for_activity(stats, current_date=day_10)
    assert res_reset["streak_count"] == 1
    assert stats.longest_streak == 3


def test_hearts_depletion_and_regeneration():
    t0 = datetime(2026, 9, 25, 10, 0, 0)
    stats = UserStats(hearts=5, max_hearts=5, hearts_updated_at=t0)

    # Lose 2 hearts
    apply_wrong_answer_heart_loss(stats, now_dt=t0)
    apply_wrong_answer_heart_loss(stats, now_dt=t0)
    assert stats.hearts == 3

    # After 4 hours -> +1 heart regenerated (total 4)
    t_plus_4h = t0 + timedelta(hours=4, minutes=5)
    info = sync_hearts(stats, now_dt=t_plus_4h)
    assert info["hearts"] == 4
    assert info["seconds_until_next_heart"] > 0

    # After 8 hours total -> capped at max_hearts (5)
    t_plus_8h = t0 + timedelta(hours=8, minutes=10)
    info_full = sync_hearts(stats, now_dt=t_plus_8h)
    assert info_full["hearts"] == 5
    assert info_full["seconds_until_next_heart"] == 0


def test_xp_calculation_and_boost_stacking():
    now = datetime(2026, 9, 25, 12, 0, 0)
    # Normal lesson with 100% accuracy (base 15 + 5 accuracy bonus = 20)
    res_normal = calculate_lesson_xp(base_xp=15, accuracy=100.0, is_legendary=False, xp_boost_until=None, now_dt=now)
    assert res_normal["total_xp"] == 20
    assert res_normal["multiplier"] == 1

    # Active XP Boost (2x multiplier) + Legendary bonus (+15) -> (15 + 5 + 15) * 2 = 70 XP
    boost_future = now + timedelta(minutes=10)
    res_boosted = calculate_lesson_xp(
        base_xp=15,
        accuracy=100.0,
        is_legendary=True,
        xp_boost_until=boost_future,
        now_dt=now,
    )
    assert res_boosted["multiplier"] == 2
    assert res_boosted["total_xp"] == 70


def test_fuzzy_typo_tolerance():
    # Exact match
    ok, typo, _ = evaluate_answer("type_answer", "Thank you very much friend", "Thank you very much friend")
    assert ok is True and typo is False

    # 1-char typo ('Thnk you very much friend') -> accepted with typo flag!
    ok_typo, has_typo, msg = evaluate_answer("type_answer", "Thnk you very much friend", "Thank you very much friend")
    assert ok_typo is True
    assert has_typo is True
    assert "typo" in msg.lower()

    # Completely wrong answer -> rejected
    ok_bad, _, _ = evaluate_answer("type_answer", "Where is the airport", "Thank you very much friend")
    assert ok_bad is False


def test_api_lesson_loop_and_idempotency():
    with TestClient(app) as client:
        # 1. Health check
        h = client.get("/health")
        assert h.status_code == 200
        assert h.json()["status"] == "healthy"

        # 2. Guest login
        auth_res = client.post("/api/v1/auth/guest")
        assert auth_res.status_code == 200
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Fetch course path
        path_res = client.get("/api/v1/courses/1/path", headers=headers)
        assert path_res.status_code == 200
        units = path_res.json()["units"]
        assert len(units) >= 3
        first_lesson_id = units[0]["skills"][0]["lesson_id"]

        # 4. Complete lesson with idempotency_key
        idem_key = f"pytest-idem-{datetime.utcnow().timestamp()}"
        comp1 = client.post(
            f"/api/v1/lessons/{first_lesson_id}/complete",
            json={"idempotency_key": idem_key, "correct_count": 7, "total_questions": 7},
            headers=headers,
        )
        assert comp1.status_code == 200
        xp_after_first = comp1.json()["user"]["stats"]["xp_total"]
        assert comp1.json()["idempotent_replay"] is False

        # 5. Replay identical request -> must NOT double-award XP!
        comp2 = client.post(
            f"/api/v1/lessons/{first_lesson_id}/complete",
            json={"idempotency_key": idem_key, "correct_count": 7, "total_questions": 7},
            headers=headers,
        )
        assert comp2.status_code == 200
        assert comp2.json()["idempotent_replay"] is True
        assert comp2.json()["user"]["stats"]["xp_total"] == xp_after_first

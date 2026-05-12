from sqlalchemy.orm import Session

from server.models.record import UserStats, LevelProgress
from server.models.achievement import Achievement, UserAchievement


def check_achievements(user_id: int, db: Session) -> list[dict]:
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        return []

    total_questions = stats.total_questions
    total_correct = stats.total_correct
    total_score = stats.total_score
    accuracy = total_correct / total_questions if total_questions > 0 else 0

    level_progresses = db.query(LevelProgress).filter(LevelProgress.user_id == user_id).all()
    total_stars = sum(lp.stars for lp in level_progresses)

    stat_map = {
        "total_correct": total_correct,
        "total_questions": total_questions,
        "score": total_score,
        "max_combo": stats.max_combo,
        "practice_count": stats.practice_count,
        "extreme_passes": stats.extreme_passes,
        "extreme_dual_passes": stats.extreme_dual_passes,
        "total_stars": total_stars,
        "accuracy": accuracy,
    }

    all_achievements = db.query(Achievement).all()
    unlocked = {
        ua.achievement_id
        for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    }

    new_achievements = []
    for ach in all_achievements:
        if ach.id in unlocked:
            continue

        condition_type = ach.condition_type
        target = ach.condition_value

        if condition_type == "accuracy":
            current = accuracy
        elif condition_type == "total_questions_threshold":
            current = total_questions
        elif condition_type == "total_correct_threshold":
            current = total_correct
        else:
            current = stat_map.get(condition_type, 0)

        if condition_type == "accuracy":
            is_complete = total_questions >= 20 and current >= target / 100
        else:
            is_complete = current >= target

        if is_complete:
            ua = UserAchievement(user_id=user_id, achievement_id=ach.id)
            db.add(ua)
            new_achievements.append({
                "id": ach.id,
                "name": ach.name,
                "icon": ach.icon,
                "description": ach.description,
                "rarity": ach.rarity,
                "category": ach.category,
            })

    if new_achievements:
        db.commit()

    return new_achievements

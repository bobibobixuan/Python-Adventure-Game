from datetime import datetime, date, timedelta, timezone

from sqlalchemy import func, case, desc
from sqlalchemy.orm import Session

from server.models.user import User
from server.models.unit import Unit, Level
from server.models.question import Question
from server.models.record import AnswerRecord, LevelProgress, UserStats


def get_enhanced_dashboard(db: Session) -> dict:
    user_count = db.query(User).count()
    question_count = db.query(Question).filter(Question.is_active == True).count()
    answer_count = db.query(AnswerRecord).count()

    total_questions = db.query(UserStats.total_questions).all()
    total_q = sum(s[0] for s in total_questions)
    total_correct = db.query(UserStats.total_correct).all()
    total_c = sum(s[0] for s in total_correct)
    avg_accuracy = round(total_c / total_q * 100, 1) if total_q > 0 else 0.0

    all_scores = db.query(UserStats.total_score).all()
    user_with_scores = [s[0] for s in all_scores if s[0] > 0]
    avg_score = round(sum(user_with_scores) / len(user_with_scores), 1) if user_with_scores else 0.0

    today_start = datetime.combine(date.today(), datetime.min.time())
    active_today = (
        db.query(func.count(func.distinct(AnswerRecord.user_id)))
        .filter(AnswerRecord.created_at >= today_start)
        .scalar()
    )

    seven_days_ago = datetime.combine(date.today() - timedelta(days=6), datetime.min.time())
    daily_rows = (
        db.query(
            func.date(AnswerRecord.created_at).label("d"),
            func.count().label("c"),
        )
        .filter(AnswerRecord.created_at >= seven_days_ago)
        .group_by("d")
        .order_by("d")
        .all()
    )
    daily_trend = [{"date": str(row.d), "count": row.c} for row in daily_rows]

    unit_rows = (
        db.query(
            Unit.name,
            func.coalesce(
                func.sum(case((AnswerRecord.is_correct == True, 1), else_=0)) * 100.0 /
                func.nullif(func.count(AnswerRecord.id), 0), 0
            ).label("acc"),
        )
        .join(Level, Level.unit_id == Unit.id)
        .join(Question, Question.level_id == Level.id)
        .join(AnswerRecord, AnswerRecord.question_id == Question.id)
        .group_by(Unit.name)
        .order_by(Unit.sort_order)
        .all()
    )
    unit_accuracy = [{"unit_name": row.name, "accuracy": round(row.acc, 1)} for row in unit_rows]

    return {
        "user_count": user_count,
        "question_count": question_count,
        "answer_count": answer_count,
        "avg_accuracy": avg_accuracy,
        "avg_score": avg_score,
        "active_today": active_today,
        "daily_trend": daily_trend,
        "unit_accuracy": unit_accuracy,
    }


def get_students(
    db: Session,
    sort_by: str = "total_score",
    order: str = "desc",
    search: str = "",
    page: int = 1,
    page_size: int = 20,
) -> dict:
    base_q = (
        db.query(User, UserStats, func.max(AnswerRecord.created_at).label("last_active"))
        .outerjoin(UserStats, UserStats.user_id == User.id)
        .outerjoin(AnswerRecord, AnswerRecord.user_id == User.id)
        .filter(User.role == "user")
        .group_by(User.id)
    )
    if search:
        base_q = base_q.filter(User.nickname.contains(search))

    total = base_q.count()

    order_col = {
        "total_score": UserStats.total_score,
        "accuracy": func.coalesce(
            UserStats.total_correct * 100.0 / func.nullif(UserStats.total_questions, 0), 0
        ),
        "total_questions": UserStats.total_questions,
        "completed_levels": func.coalesce(
            db.query(LevelProgress)
            .filter(LevelProgress.user_id == User.id, LevelProgress.stars > 0)
            .correlate(User)
            .with_entities(func.count())
            .scalar_subquery(), 0
        ),
    }
    col = order_col.get(sort_by, UserStats.total_score)
    if order == "asc":
        col = col.asc()
    else:
        col = col.desc()

    rows = base_q.order_by(col).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for user, stats, last_active in rows:
        total_q = stats.total_questions if stats else 0
        total_c = stats.total_correct if stats else 0
        acc = round(total_c / total_q * 100, 1) if total_q > 0 else 0.0

        completed = (
            db.query(LevelProgress)
            .filter(LevelProgress.user_id == user.id, LevelProgress.stars > 0)
            .count()
        )
        total_stars_q = (
            db.query(func.coalesce(func.sum(LevelProgress.stars), 0))
            .filter(LevelProgress.user_id == user.id)
            .scalar()
        )

        items.append({
            "user_id": user.id,
            "username": user.username,
            "nickname": user.nickname,
            "total_score": stats.total_score if stats else 0,
            "accuracy": acc,
            "total_questions": total_q,
            "completed_levels": completed,
            "total_stars": total_stars_q,
            "practice_count": stats.practice_count if stats else 0,
            "last_active": last_active.isoformat() if last_active else None,
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


def get_student_detail(db: Session, user_id: int) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    total_q = stats.total_questions if stats else 0
    total_c = stats.total_correct if stats else 0
    acc = round(total_c / total_q * 100, 1) if total_q > 0 else 0.0

    summary = {
        "total_score": stats.total_score if stats else 0,
        "accuracy": acc,
        "max_combo": stats.max_combo if stats else 0,
        "total_questions": total_q,
        "total_correct": total_c,
        "practice_count": stats.practice_count if stats else 0,
        "extreme_passes": stats.extreme_passes if stats else 0,
    }

    units = db.query(Unit).filter(Unit.is_active == True).order_by(Unit.sort_order).all()
    unit_progress = []
    all_level_ids = []
    for unit in units:
        levels = (
            db.query(Level)
            .filter(Level.unit_id == unit.id, Level.is_active == True)
            .order_by(Level.sort_order)
            .all()
        )
        all_level_ids.extend([l.id for l in levels])
        progresses = {
            lp.level_id: lp
            for lp in db.query(LevelProgress)
            .filter(LevelProgress.user_id == user_id, LevelProgress.level_id.in_([l.id for l in levels]))
            .all()
        }
        unit_progress.append({
            "unit_name": unit.name,
            "levels": [
                {
                    "level_name": l.name,
                    "stars": progresses[l.id].stars if l.id in progresses else 0,
                    "unlocked": progresses[l.id].unlocked if l.id in progresses else (l.sort_order == 0),
                }
                for l in levels
            ],
        })

    recent_answers = (
        db.query(AnswerRecord, Question.content)
        .join(Question, Question.id == AnswerRecord.question_id)
        .filter(AnswerRecord.user_id == user_id)
        .order_by(AnswerRecord.created_at.desc())
        .limit(20)
        .all()
    )
    recent_list = [
        {
            "question_content": content,
            "user_answer": rec.user_answer,
            "is_correct": rec.is_correct,
            "time_spent": rec.time_spent,
            "created_at": rec.created_at.isoformat() if rec.created_at else "",
        }
        for rec, content in recent_answers
    ]

    wrong_records = (
        db.query(AnswerRecord, Question.content, Question.answer, Unit.name, Level.name)
        .join(Question, Question.id == AnswerRecord.question_id)
        .join(Level, Level.id == Question.level_id)
        .join(Unit, Unit.id == Level.unit_id)
        .filter(AnswerRecord.user_id == user_id, AnswerRecord.is_correct == False)
        .order_by(AnswerRecord.created_at.desc())
        .limit(20)
        .all()
    )
    wrong_list = [
        {
            "id": rec.id,
            "question_content": content,
            "correct_answer": ans,
            "user_answer": rec.user_answer,
            "unit_name": unit_name,
            "level_name": level_name,
        }
        for rec, content, ans, unit_name, level_name in wrong_records
    ]

    return {
        "user_id": user.id,
        "username": user.username,
        "nickname": user.nickname,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "summary": summary,
        "unit_progress": unit_progress,
        "recent_answers": recent_list,
        "wrong_questions": wrong_list,
    }


def get_level_analytics(db: Session) -> list:
    rows = (
        db.query(
            Unit.name.label("unit_name"),
            Level.name.label("level_name"),
            func.count(AnswerRecord.id).label("total_attempts"),
            func.coalesce(
                func.sum(case((AnswerRecord.is_correct == True, 1), else_=0)) * 100.0 /
                func.nullif(func.count(AnswerRecord.id), 0), 0
            ).label("correct_rate"),
            func.coalesce(func.avg(AnswerRecord.time_spent), 0).label("avg_time_spent"),
            func.count(func.distinct(AnswerRecord.user_id)).label("student_count"),
        )
        .join(Question, Question.id == AnswerRecord.question_id)
        .join(Level, Level.id == Question.level_id)
        .join(Unit, Unit.id == Level.unit_id)
        .filter(Level.is_active == True)
        .group_by(Unit.name, Level.name, Unit.sort_order, Level.sort_order)
        .order_by("correct_rate")
        .all()
    )
    return [
        {
            "unit_name": row.unit_name,
            "level_name": row.level_name,
            "total_attempts": row.total_attempts,
            "correct_rate": round(row.correct_rate, 1),
            "avg_time_spent": round(row.avg_time_spent, 1),
            "student_count": row.student_count,
        }
        for row in rows
    ]


def get_wrong_question_stats(db: Session, limit: int = 50) -> list:
    rows = (
        db.query(
            Question.id.label("question_id"),
            Question.content.label("question_content"),
            Question.type.label("question_type"),
            Question.answer.label("correct_answer"),
            func.count(AnswerRecord.id).label("wrong_count"),
            (
                func.count(AnswerRecord.id) * 100.0 /
                func.nullif(
                    db.query(func.count(AnswerRecord.id))
                    .filter(AnswerRecord.question_id == Question.id)
                    .correlate(Question)
                    .scalar_subquery(), 0
                )
            ).label("wrong_rate"),
            Unit.name.label("unit_name"),
            Level.name.label("level_name"),
        )
        .select_from(Question)
        .join(AnswerRecord, AnswerRecord.question_id == Question.id)
        .join(Level, Level.id == Question.level_id)
        .join(Unit, Unit.id == Level.unit_id)
        .filter(AnswerRecord.is_correct == False)
        .group_by(Question.id)
        .order_by(desc("wrong_count"))
        .limit(limit)
        .all()
    )
    return [
        {
            "question_id": row.question_id,
            "question_content": row.question_content,
            "question_type": row.question_type,
            "wrong_count": row.wrong_count,
            "wrong_rate": round(row.wrong_rate, 1),
            "correct_answer": row.correct_answer,
            "unit_name": row.unit_name,
            "level_name": row.level_name,
        }
        for row in rows
    ]

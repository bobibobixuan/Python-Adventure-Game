from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies import get_current_user
from server.models.user import User
from server.models.record import AnswerRecord, LevelProgress, UserStats
from server.models.question import Question
from server.schemas.record import AnswerSubmit, AnswerSubmitResponse, UserSummaryOut, WrongQuestionOut
from server.routers import records_router


@records_router.post("/answer", response_model=AnswerSubmitResponse)
def submit_answer(body: AnswerSubmit, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    question = db.query(Question).filter(Question.id == body.question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="题目不存在")

    record = AnswerRecord(
        user_id=user.id,
        question_id=body.question_id,
        user_answer=body.user_answer,
        is_correct=body.is_correct,
        time_spent=body.time_spent,
        mode=body.mode,
    )
    db.add(record)

    stats = db.query(UserStats).filter(UserStats.user_id == user.id).first()
    if not stats:
        stats = UserStats(user_id=user.id)
        db.add(stats)
        db.flush()

    stats.total_questions += 1
    if body.is_correct:
        stats.total_correct += 1
        stats.total_score += 100

    if body.mode == "practice":
        stats.practice_count += 1

    db.commit()

    return AnswerSubmitResponse(success=True, score_added=100 if body.is_correct else 0, new_achievements=[])


@records_router.get("/summary", response_model=UserSummaryOut)
def get_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    stats = db.query(UserStats).filter(UserStats.user_id == user.id).first()
    if not stats:
        return UserSummaryOut(
            total_questions=0, total_correct=0, accuracy=0.0,
            total_score=0, max_combo=0, practice_count=0,
            extreme_passes=0, extreme_dual_passes=0,
            total_stars=0, completed_levels=0, unlocked_levels=0, total_levels=0,
        )

    total_questions = stats.total_questions
    total_correct = stats.total_correct
    accuracy = (total_correct / total_questions * 100) if total_questions > 0 else 0.0

    level_progresses = db.query(LevelProgress).filter(LevelProgress.user_id == user.id).all()
    total_stars = sum(lp.stars for lp in level_progresses)
    completed = sum(1 for lp in level_progresses if lp.stars > 0)
    unlocked = sum(1 for lp in level_progresses if lp.unlocked)
    total_levels = len(level_progresses)

    return UserSummaryOut(
        total_questions=total_questions,
        total_correct=total_correct,
        accuracy=round(accuracy, 1),
        total_score=stats.total_score,
        max_combo=stats.max_combo,
        practice_count=stats.practice_count,
        extreme_passes=stats.extreme_passes,
        extreme_dual_passes=stats.extreme_dual_passes,
        total_stars=total_stars,
        completed_levels=completed,
        unlocked_levels=unlocked,
        total_levels=total_levels,
    )


@records_router.get("/wrong", response_model=list[WrongQuestionOut])
def get_wrong_questions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    records = (
        db.query(AnswerRecord)
        .filter(AnswerRecord.user_id == user.id, AnswerRecord.is_correct == False)
        .order_by(AnswerRecord.created_at.desc())
        .limit(200)
        .all()
    )

    result = []
    for r in records:
        q = r.question
        level = q.level if q else None
        unit = level.unit if level else None
        result.append(WrongQuestionOut(
            id=r.id,
            question_id=r.question_id,
            question_content=q.content if q else "题目已移除",
            question_type=q.type if q else "未知",
            user_answer=r.user_answer,
            correct_answer=q.answer if q else "未知",
            unit_name=unit.name if unit else "未知单元",
            level_name=level.name if level else "未知关卡",
            timestamp=r.created_at.isoformat() if r.created_at else "",
            knowledge={
                "meaning": q.knowledge_meaning,
                "rule": q.knowledge_rule,
                "error": q.knowledge_error,
                "example": q.knowledge_example,
            } if q else None,
        ))
    return result

from fastapi import Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies import get_admin_user
from server.models.user import User
from server.models.question import Question
from server.routers import admin_router
from server.services.stats_service import (
    get_enhanced_dashboard,
    get_students,
    get_student_detail,
    get_level_analytics,
    get_wrong_question_stats,
)
from server.schemas.admin import (
    DashboardOut,
    StudentListResponse,
    StudentDetailOut,
    LevelAnalyticsOut,
    WrongQuestionStatsOut,
)


@admin_router.get("/dashboard", response_model=DashboardOut)
def dashboard(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    return get_enhanced_dashboard(db)


@admin_router.get("/students", response_model=StudentListResponse)
def list_students(
    sort_by: str = Query("total_score"),
    order: str = Query("desc"),
    search: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return get_students(db, sort_by=sort_by, order=order, search=search, page=page, page_size=page_size)


@admin_router.get("/students/{user_id}", response_model=StudentDetailOut)
def student_detail(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = get_student_detail(db, user_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")
    return result


@admin_router.get("/analytics/levels", response_model=list[LevelAnalyticsOut])
def level_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return get_level_analytics(db)


@admin_router.get("/analytics/wrong-questions", response_model=list[WrongQuestionStatsOut])
def wrong_question_stats(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return get_wrong_question_stats(db, limit=limit)


@admin_router.post("/questions")
def create_question(
    body: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    question = Question(
        level_id=body["level_id"],
        type=body["type"],
        content=body["content"],
        options=body.get("options"),
        answer=body["answer"],
        knowledge_meaning=body.get("knowledge_meaning", ""),
        knowledge_rule=body.get("knowledge_rule", ""),
        knowledge_error=body.get("knowledge_error", ""),
        knowledge_example=body.get("knowledge_example", ""),
        sort_order=body.get("sort_order", 0),
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return {"id": question.id, "message": "题目已创建"}


@admin_router.put("/questions/{question_id}")
def update_question(
    question_id: int,
    body: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="题目不存在")

    for field in ["level_id", "type", "content", "options", "answer",
                   "knowledge_meaning", "knowledge_rule", "knowledge_error", "knowledge_example", "sort_order"]:
        if field in body:
            setattr(question, field, body[field])

    db.commit()
    return {"id": question.id, "message": "题目已更新"}


@admin_router.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="题目不存在")

    question.is_active = False
    db.commit()
    return {"id": question.id, "message": "题目已删除（软删除）"}


@admin_router.get("/users")
def list_users(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "nickname": u.nickname,
            "role": u.role,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]

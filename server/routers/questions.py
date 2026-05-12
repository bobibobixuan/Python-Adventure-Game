from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies import get_current_user
from server.models.user import User
from server.models.unit import Level
from server.models.question import Question
from server.schemas.question import QuestionOut, OptionOut, KnowledgeOut
from server.routers import questions_router


@questions_router.get("/levels/{level_id}", response_model=list[QuestionOut])
def get_level_questions(level_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    level = db.query(Level).filter(Level.id == level_id, Level.is_active == True).first()
    if not level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="关卡不存在")

    questions = (
        db.query(Question)
        .filter(Question.level_id == level_id, Question.is_active == True)
        .order_by(Question.sort_order)
        .all()
    )

    return [
        QuestionOut(
            id=q.id,
            category=level.name,
            category_id=level.sort_order,
            type=q.type,
            content=q.content,
            options=[OptionOut(**opt) for opt in (q.options or [])] if q.options else None,
            answer=q.answer,
            knowledge=KnowledgeOut(
                meaning=q.knowledge_meaning,
                rule=q.knowledge_rule,
                error=q.knowledge_error,
                example=q.knowledge_example,
            ),
        )
        for q in questions
    ]

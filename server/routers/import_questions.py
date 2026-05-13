from fastapi import Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from server.database import get_db
from server.dependencies import get_admin_user
from server.models.user import User
from server.models.unit import Unit, Level
from server.models.question import Question
from server.routers import admin_router


class OptionItem(BaseModel):
    letter: str
    text: str


class QuestionItem(BaseModel):
    type: str
    content: str
    options: Optional[list[OptionItem]] = None
    answer: str
    explanation: str = ""
    difficulty: int = 1


class ImportPayload(BaseModel):
    version: str
    unit: str
    questions: list[QuestionItem]


@admin_router.post("/import")
def import_questions(
    payload: ImportPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    if len(payload.questions) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="单次最多导入500题"
        )

    valid_types = {"选择题", "判断题", "填空题"}
    for i, q in enumerate(payload.questions):
        if q.type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"第{i+1}题: 无效的题目类型 '{q.type}'"
            )
        if q.type == "选择题" and (not q.options or len(q.options) < 2):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"第{i+1}题: 选择题缺少选项"
            )
        if not q.answer or not q.answer.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"第{i+1}题: 缺少答案"
            )

    # 查找或创建单元
    unit = db.query(Unit).filter(Unit.name == payload.unit).first()
    if not unit:
        max_order = db.query(Unit).count()
        unit = Unit(
            name=payload.unit,
            icon="📚",
            subtitle=payload.unit,
            description=payload.unit,
            sort_order=max_order,
        )
        db.add(unit)
        db.flush()

    # 获取或创建关卡（每5题一组）
    level_count = db.query(Level).filter(Level.unit_id == unit.id).count()
    existing_max_sort = (
        db.query(Level)
        .filter(Level.unit_id == unit.id)
        .order_by(Level.sort_order.desc())
        .first()
    )
    base_sort = (existing_max_sort.sort_order + 1) if existing_max_sort else 0

    imported = 0
    for batch_start in range(0, len(payload.questions), 5):
        batch = payload.questions[batch_start:batch_start + 5]
        level_index = level_count + (batch_start // 5)

        level_name = f"第{level_index + 1}关"
        level = Level(
            unit_id=unit.id,
            name=level_name,
            icon="📝",
            bg="🏰",
            questions_count=len(batch),
            sort_order=base_sort + (batch_start // 5),
        )
        db.add(level)
        db.flush()

        for idx, q in enumerate(batch):
            options_list = None
            if q.options:
                options_list = [{"letter": o.letter, "text": o.text} for o in q.options]

            question = Question(
                level_id=level.id,
                type=q.type,
                content=q.content,
                options=options_list,
                answer=q.answer.strip(),
                knowledge_meaning=q.explanation,
                knowledge_rule="",
                knowledge_error="",
                knowledge_example="",
                sort_order=idx,
            )
            db.add(question)
            imported += 1

    db.commit()

    return {
        "message": f"导入成功！单元「{payload.unit}」新增 {imported} 题，{len(payload.questions) // 5 + (1 if len(payload.questions) % 5 else 0)} 关"
    }

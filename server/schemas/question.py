from pydantic import BaseModel
from typing import Optional


class OptionOut(BaseModel):
    letter: str
    text: str


class KnowledgeOut(BaseModel):
    meaning: str
    rule: str
    error: str
    example: str


class QuestionOut(BaseModel):
    id: int
    category: str
    category_id: int
    type: str
    content: str
    options: Optional[list[OptionOut]] = None
    answer: str
    knowledge: KnowledgeOut

    class Config:
        from_attributes = True


class UnitOut(BaseModel):
    id: int
    name: str
    icon: str
    subtitle: str
    description: str
    learning_goal: str
    coach_line: str
    starter_tip: str
    color: str
    levels: int

    class Config:
        from_attributes = True


class LevelOut(BaseModel):
    name: str
    icon: str
    bg: str
    questions: int

    class Config:
        from_attributes = True


class LevelProgressOut(BaseModel):
    level_id: int
    name: str
    icon: str
    bg: str
    stars: int
    unlocked: bool

    class Config:
        from_attributes = True


class UnitProgressOut(BaseModel):
    unit_id: int
    unit_name: str
    unit_icon: str
    levels: list[LevelProgressOut]

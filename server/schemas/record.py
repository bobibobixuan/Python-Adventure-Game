from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AnswerSubmit(BaseModel):
    question_id: int
    user_answer: str
    is_correct: bool
    time_spent: float = 0.0
    mode: str = "adventure"


class AnswerSubmitResponse(BaseModel):
    success: bool
    score_added: int = 0
    new_achievements: list[dict] = []


class UserSummaryOut(BaseModel):
    total_questions: int
    total_correct: int
    accuracy: float
    total_score: int
    max_combo: int
    practice_count: int
    extreme_passes: int
    extreme_dual_passes: int
    total_stars: int
    completed_levels: int
    unlocked_levels: int
    total_levels: int


class WrongQuestionOut(BaseModel):
    id: int
    question_id: int
    question_content: str
    question_type: str
    user_answer: str
    correct_answer: str
    unit_name: str
    level_name: str
    timestamp: str
    knowledge: Optional[dict] = None


class LeaderboardEntry(BaseModel):
    rank: int
    nickname: str
    total_score: int
    accuracy: float
    total_questions: int

    class Config:
        from_attributes = True

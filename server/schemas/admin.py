from pydantic import BaseModel
from typing import Optional


class StudentListItem(BaseModel):
    user_id: int
    username: str
    nickname: str
    total_score: int
    accuracy: float
    total_questions: int
    completed_levels: int
    total_stars: int
    practice_count: int
    last_active: Optional[str] = None


class StudentListResponse(BaseModel):
    items: list[StudentListItem]
    total: int
    page: int
    page_size: int


class StudentSummary(BaseModel):
    total_score: int
    accuracy: float
    max_combo: int
    total_questions: int
    total_correct: int
    practice_count: int
    extreme_passes: int


class LevelProgressItem(BaseModel):
    level_name: str
    stars: int
    unlocked: bool


class UnitProgressItem(BaseModel):
    unit_name: str
    levels: list[LevelProgressItem]


class RecentAnswerItem(BaseModel):
    question_content: str
    user_answer: str
    is_correct: bool
    time_spent: float
    created_at: str


class WrongQuestionItem(BaseModel):
    id: int
    question_content: str
    correct_answer: str
    user_answer: str
    unit_name: str
    level_name: str


class StudentDetailOut(BaseModel):
    user_id: int
    username: str
    nickname: str
    created_at: Optional[str]
    summary: StudentSummary
    unit_progress: list[UnitProgressItem]
    recent_answers: list[RecentAnswerItem]
    wrong_questions: list[WrongQuestionItem]


class LevelAnalyticsOut(BaseModel):
    unit_name: str
    level_name: str
    total_attempts: int
    correct_rate: float
    avg_time_spent: float
    student_count: int


class WrongQuestionStatsOut(BaseModel):
    question_id: int
    question_content: str
    question_type: str
    wrong_count: int
    wrong_rate: float
    correct_answer: str
    unit_name: str
    level_name: str


class DailyTrendItem(BaseModel):
    date: str
    count: int


class UnitAccuracyItem(BaseModel):
    unit_name: str
    accuracy: float


class DashboardOut(BaseModel):
    user_count: int
    question_count: int
    answer_count: int
    avg_accuracy: float
    avg_score: float
    active_today: int
    daily_trend: list[DailyTrendItem]
    unit_accuracy: list[UnitAccuracyItem]

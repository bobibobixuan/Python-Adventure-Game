from pydantic import BaseModel, Field


class UserRegister(BaseModel):
    username: str = Field(min_length=2, max_length=50)
    password: str = Field(min_length=6, max_length=100)
    nickname: str = Field(min_length=1, max_length=50)


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class TokenRefresh(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    username: str
    nickname: str
    role: str

    class Config:
        from_attributes = True

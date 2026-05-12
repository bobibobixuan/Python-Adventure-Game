const API_BASE = 'http://localhost:8000/api';

const ApiClient = {
    _accessToken: null,
    _refreshToken: null,

    init() {
        try {
            this._accessToken = localStorage.getItem('api_access_token');
            this._refreshToken = localStorage.getItem('api_refresh_token');
        } catch (e) {
            this._accessToken = null;
            this._refreshToken = null;
        }
    },

    setTokens(access, refresh) {
        this._accessToken = access;
        this._refreshToken = refresh;
        try {
            localStorage.setItem('api_access_token', access);
            localStorage.setItem('api_refresh_token', refresh);
        } catch (e) { /* ignore */ }
    },

    clearTokens() {
        this._accessToken = null;
        this._refreshToken = null;
        try {
            localStorage.removeItem('api_access_token');
            localStorage.removeItem('api_refresh_token');
        } catch (e) { /* ignore */ }
    },

    isLoggedIn() {
        return Boolean(this._accessToken);
    },

    async _fetch(path, options = {}) {
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (this._accessToken) {
            headers['Authorization'] = `Bearer ${this._accessToken}`;
        }

        let resp = await fetch(`${API_BASE}${path}`, { ...options, headers });

        if (resp.status === 401 && this._refreshToken) {
            const refreshResp = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: this._refreshToken }),
            });
            if (refreshResp.ok) {
                const data = await refreshResp.json();
                this.setTokens(data.access_token, data.refresh_token);
                headers['Authorization'] = `Bearer ${this._accessToken}`;
                resp = await fetch(`${API_BASE}${path}`, { ...options, headers });
            } else {
                this.clearTokens();
            }
        }

        return resp;
    },

    async register(username, password, nickname) {
        const resp = await this._fetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, nickname }),
        });
        const data = await resp.json();
        if (resp.ok) {
            this.setTokens(data.access_token, data.refresh_token);
        }
        return { ok: resp.ok, data };
    },

    async login(username, password) {
        const resp = await this._fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        const data = await resp.json();
        if (resp.ok) {
            this.setTokens(data.access_token, data.refresh_token);
        }
        return { ok: resp.ok, data };
    },

    logout() {
        this.clearTokens();
    },

    async getUnits() {
        const resp = await this._fetch('/units/');
        return resp.ok ? await resp.json() : null;
    },

    async getLevels(unitId) {
        const resp = await this._fetch(`/units/${unitId}/levels`);
        return resp.ok ? await resp.json() : null;
    },

    async getQuestions(levelId) {
        const resp = await this._fetch(`/questions/levels/${levelId}`);
        return resp.ok ? await resp.json() : null;
    },

    async submitAnswer(questionId, userAnswer, isCorrect, timeSpent, mode) {
        const resp = await this._fetch('/records/answer', {
            method: 'POST',
            body: JSON.stringify({
                question_id: questionId,
                user_answer: userAnswer,
                is_correct: isCorrect,
                time_spent: timeSpent,
                mode: mode,
            }),
        });
        return resp.ok ? await resp.json() : null;
    },

    async getSummary() {
        const resp = await this._fetch('/records/summary');
        return resp.ok ? await resp.json() : null;
    },

    async getProgress() {
        const resp = await this._fetch('/scores/progress');
        return resp.ok ? await resp.json() : null;
    },

    async getAchievements() {
        const resp = await this._fetch('/achievements/');
        return resp.ok ? await resp.json() : null;
    },

    async getLeaderboard(limit = 50) {
        const resp = await this._fetch(`/leaderboard/?limit=${limit}`);
        return resp.ok ? await resp.json() : null;
    },

    async syncProgress(progressData) {
        const resp = await this._fetch('/scores/sync', {
            method: 'POST',
            body: JSON.stringify(progressData),
        });
        return resp.ok ? await resp.json() : null;
    },
};

ApiClient.init();

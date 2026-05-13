// API Layer - 所有后端通信集中在这里
const API = (() => {
    const TOKEN_KEY = 'jwt_token';
    const USER_KEY = 'current_user';

    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    function setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    function clearToken() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    function getCurrentUser() {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function setCurrentUser(user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    async function fetchAPI(path, options = {}) {
        const token = getToken();
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const resp = await fetch(path, { ...options, headers });
        if (resp.status === 401) {
            clearToken();
            throw new Error('登录已过期，请重新登录');
        }
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ detail: '请求失败' }));
            throw new Error(err.detail || `HTTP ${resp.status}`);
        }
        return resp.json();
    }

    // Auth
    async function register(username, password, nickname) {
        const data = await fetchAPI('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, nickname })
        });
        setToken(data.access_token);
        setCurrentUser(data.user);
        return data;
    }

    async function login(username, password) {
        const data = await fetchAPI('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        setToken(data.access_token);
        setCurrentUser(data.user);
        return data;
    }

    function logout() {
        clearToken();
    }

    function isLoggedIn() {
        return !!getToken();
    }

    // Questions
    async function getLevelQuestions(levelId) {
        return fetchAPI(`/api/questions/levels/${levelId}`);
    }

    // Units
    async function getUnits() {
        return fetchAPI('/api/units');
    }

    async function getUnitProgress() {
        return fetchAPI('/api/units/progress');
    }

    // Records
    async function submitRecord(record) {
        return fetchAPI('/api/records', {
            method: 'POST',
            body: JSON.stringify(record)
        });
    }

    async function getRecords() {
        return fetchAPI('/api/records');
    }

    // Scores
    async function getScores() {
        return fetchAPI('/api/scores');
    }

    // Achievements
    async function getAchievements() {
        return fetchAPI('/api/achievements');
    }

    async function checkAchievements(stats) {
        return fetchAPI('/api/achievements/check', {
            method: 'POST',
            body: JSON.stringify(stats)
        });
    }

    // Leaderboard
    async function getLeaderboard() {
        return fetchAPI('/api/leaderboard');
    }

    // Admin
    async function importQuestions(jsonData) {
        return fetchAPI('/api/admin/import', {
            method: 'POST',
            body: JSON.stringify(jsonData)
        });
    }

    return {
        getToken, setToken, clearToken,
        getCurrentUser, setCurrentUser,
        isLoggedIn,
        register, login, logout,
        getLevelQuestions, getUnits, getUnitProgress,
        submitRecord, getRecords, getScores,
        getAchievements, checkAchievements,
        getLeaderboard,
        importQuestions
    };
})();

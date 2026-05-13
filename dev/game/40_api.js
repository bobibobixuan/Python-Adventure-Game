// API Layer - 所有后端通信集中在这里

// Online Heartbeat WebSocket
const OnlineHeartbeat = (() => {
    let ws = null;
    let reconnectTimer = null;
    let reconnectAttempt = 0;
    let heartbeatTimer = null;
    let intentionalClose = false;

    function getBaseUrl() {
        const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${proto}//${location.host}`;
    }

    function connect(token) {
        if (!token) return;
        intentionalClose = false;
        // 清理旧的重连定时器和连接
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }

        function doConnect() {
            if (intentionalClose) return;
            // 关闭旧的 WebSocket，防止重复连接
            if (ws) {
                ws.onclose = null;
                ws.close();
                ws = null;
            }

            const url = `${getBaseUrl()}/ws/online`;
            ws = new WebSocket(url);

            ws.onopen = () => {
                // 发送认证消息
                ws.send(JSON.stringify({ type: 'auth', token: token }));
                // 开始定期心跳
                reconnectAttempt = 0;
                heartbeatTimer = setInterval(() => {
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'heartbeat' }));
                    }
                }, 30000);
            };

            ws.onclose = () => {
                if (heartbeatTimer) {
                    clearInterval(heartbeatTimer);
                    heartbeatTimer = null;
                }
                if (intentionalClose) return;
                scheduleReconnect(token);
            };

            ws.onerror = () => {
                console.warn('[OnlineHeartbeat] WebSocket error, onclose will follow');
            };
        }

        doConnect();
    }

    function scheduleReconnect(token) {
        reconnectAttempt++;
        // 指数退避 + 随机抖动：上限 30s
        const base = Math.min(2000 * Math.pow(2, reconnectAttempt - 1), 30000);
        const jitter = Math.random() * 3000;
        const delay = Math.min(base + jitter, 30000);

        reconnectTimer = setTimeout(() => {
            if (!intentionalClose) {
                connect(token);
            }
        }, delay);
    }

    function disconnect() {
        intentionalClose = true;
        reconnectAttempt = 0;
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
        if (ws) {
            ws.close();
            ws = null;
        }
    }

    return { connect, disconnect };
})();

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
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (_) {
            clearToken();
            return null;
        }
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
        OnlineHeartbeat.connect(data.access_token);
        return data;
    }

    async function login(username, password) {
        const data = await fetchAPI('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        setToken(data.access_token);
        setCurrentUser(data.user);
        OnlineHeartbeat.connect(data.access_token);
        return data;
    }

    function logout() {
        OnlineHeartbeat.disconnect();
        clearToken();
    }

    function isLoggedIn() {
        return !!getToken() && !!getCurrentUser();
    }

    // Questions
    async function getLevelQuestions(levelId) {
        return fetchAPI(`/api/questions/levels/${levelId}`);
    }

    // Units
    async function getUnits() {
        return fetchAPI('/api/units/');
    }

    async function getUnitLevels(unitId) {
        return fetchAPI(`/api/units/${unitId}/levels`);
    }

    // Records
    async function submitAnswer(answer) {
        return fetchAPI('/api/records/answer', {
            method: 'POST',
            body: JSON.stringify(answer)
        });
    }

    async function getSummary() {
        return fetchAPI('/api/records/summary');
    }

    async function getWrongQuestions() {
        return fetchAPI('/api/records/wrong');
    }

    // Scores / Progress
    async function getProgress() {
        return fetchAPI('/api/scores/progress');
    }

    // Achievements
    async function getAchievements() {
        return fetchAPI('/api/achievements/');
    }

    async function checkAchievements() {
        return fetchAPI('/api/achievements/check', {
            method: 'POST'
        });
    }

    // Leaderboard
    async function getLeaderboard() {
        return fetchAPI('/api/leaderboard/');
    }

    // Admin
    async function importQuestions(jsonData) {
        return fetchAPI('/api/admin/import', {
            method: 'POST',
            body: JSON.stringify(jsonData)
        });
    }

    async function syncGameState(gameState) {
        return fetchAPI('/api/records/sync-state', {
            method: 'POST',
            body: JSON.stringify(gameState)
        });
    }

    return {
        getToken, setToken, clearToken,
        getCurrentUser, setCurrentUser,
        isLoggedIn,
        register, login, logout,
        getLevelQuestions, getUnits, getUnitLevels,
        submitAnswer, getSummary, getWrongQuestions, getProgress,
        getAchievements, checkAchievements,
        getLeaderboard,
        importQuestions, syncGameState
    };
})();

// ---- Auth UI Handlers ----
let authTab = 'login';

function switchAuthTab(tab) {
    authTab = tab;
    document.getElementById('authTabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('authTabRegister').classList.toggle('active', tab === 'register');
    document.getElementById('loginForm').style.display = tab === 'login' ? '' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? '' : 'none';
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
}

function skipAuth() {
    switchScreen('startScreen');
}

async function doGameLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    errEl.textContent = '';

    if (!username || !password) { errEl.textContent = '请输入用户名和密码'; return; }

    try {
        await API.login(username, password);
        onAuthSuccess();
    } catch (e) {
        errEl.textContent = e.message;
    }
}

async function doGameRegister() {
    const nickname = document.getElementById('regNickname').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const errEl = document.getElementById('registerError');
    errEl.textContent = '';

    if (!nickname) { errEl.textContent = '请输入昵称'; return; }
    if (!username) { errEl.textContent = '请输入用户名'; return; }
    if (!password || password.length < 6) { errEl.textContent = '密码至少6位'; return; }

    try {
        await API.register(username, password, nickname);
        onAuthSuccess();
    } catch (e) {
        errEl.textContent = e.message;
    }
}

function onAuthSuccess() {
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    if (typeof renderAuthBar === 'function') {
        renderAuthBar();
    }
    if (typeof syncGameStateToServer === 'function') {
        syncGameStateToServer({ silent: true });
    }
    switchScreen('startScreen');
}

function showAuthScreen() {
    switchScreen('authScreen');
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
}

function doLogoutGame() {
    API.logout();
    if (typeof renderAuthBar === 'function') {
        renderAuthBar();
    }
    if (typeof refreshDeveloperConsole === 'function') {
        refreshDeveloperConsole('已退出登录。');
    }
}

if (API.isLoggedIn() && typeof syncGameStateToServer === 'function') {
    syncGameStateToServer({ silent: true });
}

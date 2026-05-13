// ---- Auth & State ----
const ADMIN_TOKEN_KEY = 'admin_jwt_token';
const ADMIN_USER_KEY = 'admin_user';

let currentPage = 'dashboard';
let currentSort = 'total_score';
let currentSortOrder = 'desc';
let currentStudentPage = 1;

function getToken() { return localStorage.getItem(ADMIN_TOKEN_KEY); }
function setToken(t) { localStorage.setItem(ADMIN_TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(ADMIN_TOKEN_KEY); localStorage.removeItem(ADMIN_USER_KEY); }

function showError(msg) {
    const el = document.getElementById('adminContent');
    if (el) {
        const existing = document.getElementById('adminErrorBanner');
        if (existing) existing.remove();
        const banner = document.createElement('div');
        banner.id = 'adminErrorBanner';
        banner.style.cssText = 'background:#fff0f0;color:#c62828;padding:12px 16px;margin:16px 32px 0;border-radius:8px;border:1px solid #ffcdd2;font-size:0.9em;';
        banner.textContent = '⚠ ' + msg;
        el.insertBefore(banner, el.firstChild);
        setTimeout(() => banner.remove(), 8000);
    }
}

async function fetchAdmin(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const resp = await fetch(path, { ...options, headers });
    if (resp.status === 401) {
        clearToken();
        showLogin();
        throw new Error('登录已过期');
    }
    if (!resp.ok) {
        let detail = '请求失败';
        try { const e = await resp.json(); detail = e.detail || detail; } catch (_) {}
        throw new Error(detail + ' (HTTP ' + resp.status + ')');
    }
    return resp.json();
}

// ---- Login ----
function showLogin() {
    document.getElementById('adminContent').style.display = 'none';
    document.getElementById('loginContainer').style.display = '';
    document.getElementById('adminUserDisplay').textContent = '';
}

function showContent(user) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContent').style.display = '';
    document.getElementById('adminUserDisplay').textContent = user.nickname || user.username;
    switchPage('dashboard');
}

async function doAdminLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    errEl.textContent = '';

    if (!username || !password) { errEl.textContent = '请输入用户名和密码'; return; }

    try {
        const data = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
        }).then(r => {
            if (!r.ok) return r.json().then(e => { throw new Error(e.detail || '登录失败'); });
            return r.json();
        });

        if (data.user.role !== 'admin') {
            errEl.textContent = '需要管理员账号';
            return;
        }

        setToken(data.access_token);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user));
        showContent(data.user);
    } catch (e) {
        errEl.textContent = e.message;
    }
}

function doLogout() {
    clearToken();
    showLogin();
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

// ---- Init ----
(function init() {
    const token = getToken();
    const userJson = localStorage.getItem(ADMIN_USER_KEY);
    if (token && userJson) {
        try {
            const user = JSON.parse(userJson);
            if (user.role === 'admin') {
                showContent(user);
                return;
            }
        } catch (e) {}
    }
    showLogin();

    // Sidebar nav
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });
})();

// ---- Navigation ----
function switchPage(page) {
    currentPage = page;

    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById('page-' + page);
    if (target) target.style.display = '';

    if (page === 'dashboard') loadDashboard();
    else if (page === 'students') loadStudentList();
    else if (page === 'level-analytics') loadLevelAnalytics();
    else if (page === 'wrong-questions') loadWrongQuestions();

    document.getElementById('studentDetail').style.display = 'none';
}

// ---- Dashboard ----
async function loadDashboard() {
    try {
        const data = await fetchAdmin('/api/admin/dashboard');
        document.getElementById('dashboardCards').innerHTML =
            `<div class="summary-card"><div class="card-label">学生总数</div><div class="card-value" style="color:#667eea;">${data.user_count}</div></div>
             <div class="summary-card"><div class="card-label">答题总数</div><div class="card-value" style="color:#27ae60;">${data.answer_count}</div></div>
             <div class="summary-card"><div class="card-label">平均正确率</div><div class="card-value" style="color:#f39c12;">${data.avg_accuracy}%</div></div>
             <div class="summary-card"><div class="card-label">今日活跃</div><div class="card-value" style="color:#e74c3c;">${data.active_today}</div></div>`;

        try { renderDailyTrend(data.daily_trend); } catch (e) { showError('图表渲染失败(趋势): ' + e.message); }
        try { renderUnitAccuracy(data.unit_accuracy); } catch (e) { showError('图表渲染失败(单元): ' + e.message); }
    } catch (e) {
        showError('仪表盘加载失败: ' + e.message);
    }
}

let dailyTrendChartInst = null, unitAccuracyChartInst = null;

function renderDailyTrend(trend) {
    const ctx = document.getElementById('dailyTrendChart').getContext('2d');
    if (dailyTrendChartInst) dailyTrendChartInst.destroy();
    const labels = trend.map(t => t.date);
    const values = trend.map(t => t.count);
    dailyTrendChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: '答题数',
                data: values,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102,126,234,0.08)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } },
            },
        },
    });
}

function renderUnitAccuracy(data) {
    const ctx = document.getElementById('unitAccuracyChart').getContext('2d');
    if (unitAccuracyChartInst) unitAccuracyChartInst.destroy();
    unitAccuracyChartInst = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.unit_name),
            datasets: [{
                label: '正确率 %',
                data: data.map(d => d.accuracy),
                backgroundColor: data.map(d => {
                    if (d.accuracy >= 80) return 'rgba(39,174,96,0.6)';
                    if (d.accuracy >= 60) return 'rgba(243,156,18,0.6)';
                    return 'rgba(231,76,60,0.6)';
                }),
                borderColor: data.map(d => {
                    if (d.accuracy >= 80) return '#27ae60';
                    if (d.accuracy >= 60) return '#f39c12';
                    return '#e74c3c';
                }),
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } },
        },
    });
}

// ---- Student List ----
function setSort(field) {
    if (currentSort === field) {
        currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
    } else {
        currentSort = field;
        currentSortOrder = 'desc';
    }
    currentStudentPage = 1;
    loadStudentList();
}

async function loadStudentList() {
    const search = document.getElementById('studentSearch').value || '';
    const params = new URLSearchParams({
        sort_by: currentSort, order: currentSortOrder,
        search: search, page: currentStudentPage, page_size: 20,
    });
    try {
        const data = await fetchAdmin('/api/admin/students?' + params);
        const tbody = document.getElementById('studentTableBody');
        tbody.innerHTML = data.items.map(s =>
            `<tr onclick="fetchAndRenderStudentDetail(${s.user_id})">
                <td><strong>${escapeHtml(s.nickname)}</strong><br><span style="color:#999;font-size:0.8em;">@${escapeHtml(s.username)}</span></td>
                <td>${s.total_score}</td>
                <td>${s.accuracy}%</td>
                <td>${s.completed_levels}</td>
                <td>${s.last_active ? s.last_active.substring(0, 16) : '-'}</td>
            </tr>`
        ).join('');

        const totalPages = Math.ceil(data.total / data.page_size);
        document.getElementById('studentPagination').innerHTML =
            `<button ${currentStudentPage <= 1 ? 'disabled' : ''} onclick="currentStudentPage--;loadStudentList()">上一页</button>
             <span class="page-info">第 ${data.page} / ${totalPages} 页 (共 ${data.total} 人)</span>
             <button ${currentStudentPage >= totalPages ? 'disabled' : ''} onclick="currentStudentPage++;loadStudentList()">下一页</button>`;
    } catch (e) {
        showError('学生列表加载失败: ' + e.message);
    }
}

// ---- Student Detail ----
function renderStudentDetail(data) {
    try {
    const detail = document.getElementById('studentDetail');
    detail.style.display = '';

    let progressHTML = data.unit_progress.map(u =>
        `<div class="unit-progress-item">
            <div class="unit-label">${escapeHtml(u.unit_name)}</div>
            <div class="level-bars">${u.levels.map(l =>
                `<div class="level-bar${l.unlocked ? '' : ' locked'}">
                    <div class="lb-name">${escapeHtml(l.level_name)}</div>
                    <div class="lb-stars">${'⭐'.repeat(l.stars) || '—'}</div>
                </div>`
            ).join('')}</div>
        </div>`
    ).join('');

    detail.innerHTML = `
        <button class="back-btn" onclick="closeStudentDetail()">← 返回列表</button>
        <h3 style="margin-bottom:12px;">${escapeHtml(data.nickname)} <span style="color:#999;font-size:0.7em;font-weight:400;">@${escapeHtml(data.username)}</span></h3>
        <div class="student-detail-cards">
            <div class="student-detail-card"><div class="card-label">总分</div><div class="card-value" style="color:#667eea;">${data.summary.total_score}</div></div>
            <div class="student-detail-card"><div class="card-label">正确率</div><div class="card-value" style="color:#27ae60;">${data.summary.accuracy}%</div></div>
            <div class="student-detail-card"><div class="card-label">答题数</div><div class="card-value">${data.summary.total_questions}</div></div>
            <div class="student-detail-card"><div class="card-label">最高连击</div><div class="card-value" style="color:#f39c12;">${data.summary.max_combo}</div></div>
        </div>
        <div class="unit-progress-list">${progressHTML}</div>
        <div class="tab-switcher">
            <button class="tab-btn active" onclick="switchDetailTab('recent', this, ${data.user_id})">最近答题</button>
            <button class="tab-btn" onclick="switchDetailTab('wrong', this, ${data.user_id})">错题记录</button>
        </div>
        <div id="detailTabContent"></div>
    `;

    switchDetailTab('recent', detail.querySelector('.tab-btn.active'), data.user_id);
    detail.scrollIntoView({ behavior: 'smooth' });
    } catch (e) { showError('学生详情渲染失败: ' + e.message); }
}

function closeStudentDetail() {
    document.getElementById('studentDetail').style.display = 'none';
}

function switchDetailTab(tab, btn, userId) {
    btn.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const container = document.getElementById('detailTabContent');
    if (tab === 'recent') {
        const items = window._studentDetail.recent_answers;
        container.innerHTML = items.length === 0
            ? '<p style="color:#999;padding:16px;">暂无答题记录</p>'
            : `<table class="admin-table"><thead><tr><th>题目</th><th>回答</th><th>结果</th><th>用时(s)</th><th>时间</th></tr></thead><tbody>
                ${items.map(a => `<tr>
                    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(a.question_content)}</td>
                    <td>${escapeHtml(a.user_answer)}</td>
                    <td style="color:${a.is_correct ? '#27ae60' : '#e74c3c'};">${a.is_correct ? '✓' : '✗'}</td>
                    <td>${a.time_spent.toFixed(1)}</td>
                    <td>${a.created_at.substring(0, 16)}</td>
                </tr>`).join('')}</tbody></table>`;
    } else {
        const items = window._studentDetail.wrong_questions;
        container.innerHTML = items.length === 0
            ? '<p style="color:#999;padding:16px;">暂无错题记录</p>'
            : `<table class="admin-table"><thead><tr><th>题目</th><th>学生回答</th><th>正确答案</th><th>单元</th><th>关卡</th></tr></thead><tbody>
                ${items.map(w => `<tr>
                    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(w.question_content)}</td>
                    <td style="color:#e74c3c;">${escapeHtml(w.user_answer)}</td>
                    <td style="color:#27ae60;">${escapeHtml(w.correct_answer)}</td>
                    <td>${escapeHtml(w.unit_name)}</td>
                    <td>${escapeHtml(w.level_name)}</td>
                </tr>`).join('')}</tbody></table>`;
    }
}

async function fetchAndRenderStudentDetail(userId) {
    try {
        const data = await fetchAdmin(`/api/admin/students/${userId}`);
        window._studentDetail = data;
        renderStudentDetail(data);
    } catch (e) { showError('学生详情加载失败: ' + e.message); }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---- Level Analytics ----
async function loadLevelAnalytics() {
    try {
        const data = await fetchAdmin('/api/admin/analytics/levels');
        const tbody = document.getElementById('levelAnalyticsTableBody');
        tbody.innerHTML = data.map(l => {
            let cssClass = l.correct_rate >= 80 ? 'rate-high' : (l.correct_rate >= 60 ? 'rate-mid' : 'rate-low');
            return `<tr>
                <td>${escapeHtml(l.unit_name)}</td>
                <td>${escapeHtml(l.level_name)}</td>
                <td>${l.student_count}</td>
                <td><div class="rate-bar ${cssClass}"><div class="rate-bar-fill" style="width:${l.correct_rate}px;"></div>${l.correct_rate}%</div></td>
                <td>${l.avg_time_spent}</td>
            </tr>`;
        }).join('');
    } catch (e) {
        showError('关卡分析加载失败: ' + e.message);
    }
}

// ---- Wrong Questions ----
async function loadWrongQuestions() {
    try {
        const data = await fetchAdmin('/api/admin/analytics/wrong-questions?limit=50');
        const tbody = document.getElementById('wrongQuestionsTableBody');
        tbody.innerHTML = data.map(w =>
            `<tr onclick="toggleWrongDetail(this)" data-answer="${escapeHtml(w.correct_answer)}" data-knowledge="${escapeHtml(w.unit_name + ' / ' + w.level_name)}">
                <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(w.question_content)}</td>
                <td>${escapeHtml(w.level_name)}</td>
                <td style="color:#e74c3c;font-weight:600;">${w.wrong_count}</td>
                <td style="color:#e74c3c;">${w.wrong_rate}%</td>
            </tr>`
        ).join('');
    } catch (e) {
        showError('错题统计加载失败: ' + e.message);
    }
}

function toggleWrongDetail(row) {
    const existing = row.nextElementSibling;
    if (existing && existing.classList.contains('wrong-detail-row')) {
        existing.remove();
        return;
    }
    const answer = row.dataset.answer;
    const knowledge = row.dataset.knowledge;
    const tr = document.createElement('tr');
    tr.className = 'wrong-detail-row';
    tr.innerHTML = `<td colspan="4" style="background:#fffbe6;padding:12px 16px;">
        <strong>正确答案：</strong><span style="color:#27ae60;">${answer}</span>
        <span style="margin-left:16px;"><strong>所属：</strong>${knowledge}</span>
    </td>`;
    row.parentNode.insertBefore(tr, row.nextSibling);
}

// ---- Import ----
let pendingAdminImportData = null;

function handleAdminImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.version || !data.unit || !Array.isArray(data.questions)) {
                throw new Error('格式不符合规范：需要 version, unit, questions 字段');
            }
            pendingAdminImportData = data;
            document.getElementById('importDropText').textContent = file.name;
            document.getElementById('importPreview').style.display = 'block';
            document.getElementById('importPreviewUnit').textContent = '📚 ' + data.unit;
            document.getElementById('importPreviewCount').textContent = data.questions.length + ' 题';
            const preview = document.getElementById('importPreviewQuestions');
            preview.innerHTML = data.questions.slice(0, 5).map((q, i) =>
                `<div style="padding:6px 0;border-bottom:1px solid #eee;">${i+1}. [${q.type}] ${escapeHtml(q.content.substring(0, 50))}${q.content.length > 50 ? '...' : ''}</div>`
            ).join('') + (data.questions.length > 5 ? `<div style="color:#999;padding:6px 0;">... 还有 ${data.questions.length - 5} 题</div>` : '');
            document.getElementById('importSubmitBtn').disabled = false;
        } catch (err) {
            alert('文件解析失败：' + err.message);
        }
    };
    reader.readAsText(file);
}

async function doAdminImport() {
    if (!pendingAdminImportData) return;
    const btn = document.getElementById('importSubmitBtn');
    btn.disabled = true;
    btn.textContent = '导入中...';
    const resultDiv = document.getElementById('importResult');
    try {
        const result = await fetchAdmin('/api/admin/import', {
            method: 'POST',
            body: JSON.stringify(pendingAdminImportData),
        });
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<div style="background:#e8f5e9;color:#2e7d32;padding:12px;border-radius:8px;">✅ ${result.message}</div>`;
        pendingAdminImportData = null;
        btn.style.display = 'none';
    } catch (err) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<div style="background:#ffebee;color:#c62828;padding:12px;border-radius:8px;">❌ ${err.message}</div>`;
        btn.disabled = false;
        btn.textContent = '重试导入';
    }
}

// Drag-and-drop for import
(function setupImportDnD() {
    const dropZone = document.getElementById('importDrop');
    if (!dropZone) return;
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#667eea'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#d9d9d9'; });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#d9d9d9';
        const file = e.dataTransfer.files[0];
        if (file) handleAdminImportFile(file);
    });
})();

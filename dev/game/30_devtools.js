function updateDevPassHint(message, isError = false) {
            const hint = document.getElementById('devPassHint');
            if (!hint) return;
            hint.textContent = message;
            hint.style.color = isError ? '#ff9a9a' : '#a9b4ce';
        }

        function renderDevSummary() {
            const summary = document.getElementById('devQuickSummary');
            if (!summary) return;

            const snapshotText = getStorageSnapshotText();
            const snapshotSize = new Blob([snapshotText]).size;

            const cards = [
                { label: '总积分', value: gameState.score },
                { label: '总做题数', value: gameState.totalQuestions },
                { label: '错题记录', value: gameState.wrongQuestions.length },
                { label: '已解锁成就', value: `${gameState.achievements.length}/${achievementList.length}` },
                { label: '总星数', value: getTotalStars() },
                { label: '修炼题数', value: gameState.practiceCount },
                { label: '极限通关', value: gameState.extremePasses },
                { label: '综合大考', value: gameState.extremeDualPasses },
                { label: '存档版本', value: `v${STORAGE_VERSION}` },
                { label: '快照体积', value: `${snapshotSize} B` }
            ];

            summary.innerHTML = cards.map(card => `
                <div class="dev-summary-card">
                    <div class="dev-summary-label">${card.label}</div>
                    <div class="dev-summary-value">${card.value}</div>
                </div>
            `).join('');
        }

        function renderDevUnitTabs() {
            const tabs = document.getElementById('devUnitTabs');
            if (!tabs) return;

            tabs.innerHTML = units.map((unit, unitIndex) => `
                <button class="segmented-tab ${unitIndex === devSelectedUnit ? 'active' : ''}" onclick="devSelectUnit(${unitIndex})">
                    ${getUnitDisplayName(unitIndex)}
                </button>
            `).join('');
        }

        function renderDevUnitSummary() {
            const summary = document.getElementById('devUnitSummary');
            if (!summary) return;

            const levelCount = getLevelsForUnit(devSelectedUnit).length;
            const unitWrongCount = gameState.wrongQuestions.filter(item => item.unitIndex === devSelectedUnit).length;

            summary.innerHTML = `
                <div class="dev-summary-card">
                    <div class="dev-summary-label">目标单元</div>
                    <div class="dev-summary-value">${getUnitDisplayName(devSelectedUnit)}</div>
                </div>
                <div class="dev-summary-card">
                    <div class="dev-summary-label">关卡解锁</div>
                    <div class="dev-summary-value">${getUnitUnlockedCount(devSelectedUnit)}/${levelCount}</div>
                </div>
                <div class="dev-summary-card">
                    <div class="dev-summary-label">星级与错题</div>
                    <div class="dev-summary-value">⭐ ${getUnitStarCount(devSelectedUnit)} · 错题 ${unitWrongCount}</div>
                </div>
            `;
        }

        function getStorageSnapshotText() {
            return JSON.stringify(buildPersistedGameState(), null, 2);
        }

        function renderDevStorageTools() {
            const snapshot = document.getElementById('devStorageSnapshot');
            const meta = document.getElementById('devStorageMeta');
            const status = document.getElementById('devStorageStatus');
            if (!snapshot || !meta || !status) return;

            let rawStored = '';
            try {
                rawStored = localStorage.getItem(STORAGE_KEY) || '';
            } catch (error) {
                console.warn('读取开发者快照失败。', error);
            }

            const snapshotText = getStorageSnapshotText();

            snapshot.value = snapshotText;
            meta.innerHTML = `
                <div class="dev-summary-card">
                    <div class="dev-summary-label">存档 Key</div>
                    <div class="dev-summary-value">${STORAGE_KEY}</div>
                </div>
                <div class="dev-summary-card">
                    <div class="dev-summary-label">当前版本</div>
                    <div class="dev-summary-value">v${STORAGE_VERSION}</div>
                </div>
                <div class="dev-summary-card">
                    <div class="dev-summary-label">已存储字节数</div>
                    <div class="dev-summary-value">${new Blob([rawStored || snapshotText]).size}</div>
                </div>
            `;
            status.textContent = storageStatusMessage;
        }

        async function copyDevSaveSnapshot() {
            const snapshot = document.getElementById('devStorageSnapshot');
            if (!snapshot) return;

            const snapshotText = snapshot.value.trim() || getStorageSnapshotText();

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(snapshotText);
                } else {
                    snapshot.focus();
                    snapshot.select();
                    document.execCommand('copy');
                }
                updateAdminStatus('已复制当前存档快照。');
            } catch (error) {
                updateAdminStatus('复制失败，请手动复制文本框内容。');
            }
        }

        function importDevSaveSnapshot() {
            const snapshot = document.getElementById('devStorageSnapshot');
            if (!snapshot) return;

            const raw = snapshot.value.trim();
            if (!raw) {
                updateAdminStatus('请先粘贴要导入的存档 JSON。');
                return;
            }

            try {
                const parsed = JSON.parse(raw);
                const { migrated, warnings } = applySavedGameState(parsed);
                saveGameState();
                storageStatusMessage = warnings.length > 0
                    ? warnings.join('；')
                    : migrated
                        ? '导入成功，旧存档字段已自动迁移。'
                        : '已从开发者控制台导入存档。';
                renderUnits();
                renderAchievements();
                renderLevelMap();
                refreshDeveloperConsole('存档导入成功。');
            } catch (error) {
                updateAdminStatus(`导入失败：${error.message}`);
            }
        }

        function clearStoredSave() {
            if (!confirm('确定要清空当前浏览器里的存档吗？这会恢复到默认进度。')) {
                return;
            }

            gameState = createDefaultGameState();
            storageStatusMessage = '已通过开发者控制台清空浏览器存档。';

            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (error) {
                console.warn('清空本地存档失败。', error);
            }

            renderUnits();
            renderAchievements();
            renderLevelMap();
            refreshDeveloperConsole('已清空浏览器存档并恢复默认状态。');
        }

        function refreshDeveloperConsole(statusMessage) {
            if (!units[devSelectedUnit]) {
                devSelectedUnit = units[gameState.currentUnit] ? gameState.currentUnit : 0;
            }

            renderDevSummary();
            renderDevUnitTabs();
            renderDevUnitSummary();
            renderDevStorageTools();

            if (statusMessage) {
                updateAdminStatus(statusMessage);
            }
        }

        function persistDeveloperChanges(statusMessage) {
            saveGameState();
            renderUnits();
            renderAchievements();
            renderLevelMap();
            refreshDeveloperConsole(statusMessage);
        }

        function triggerDevAccess() {
            devMenuClickCount++;
            clearTimeout(devMenuClickTimer);
            devMenuClickTimer = setTimeout(() => { devMenuClickCount = 0; }, 800);
            if (devMenuClickCount >= 5) {
                devMenuClickCount = 0;
                showDevMenu();
            }
        }

        function showDevMenu() {
            if (devAccessGranted) {
                devSelectedUnit = units[gameState.currentUnit] ? gameState.currentUnit : 0;
                switchScreen('adminScreen');
                refreshDeveloperConsole('已复用当前会话的开发者权限。');
                return;
            }

            const devScreen = document.getElementById('devMenuScreen');
            devScreen.style.display = 'flex';
            devScreen.style.top = '0';
            document.getElementById('devPassInput').value = '';
            updateDevPassHint('请输入口令以打开开发者控制台。');
            document.getElementById('devPassInput').focus();
        }

        function closeDevMenu() {
            const devScreen = document.getElementById('devMenuScreen');
            devScreen.style.top = '-100%';
            setTimeout(() => { devScreen.style.display = 'none'; }, 300);
        }

        // 升级版：SHA-256 哈希加密验证
        async function verifyDevPass() {
            const inputElement = document.getElementById('devPassInput');
            const input = inputElement.value.trim();

            if (!input) {
                updateDevPassHint('请输入开发者口令。', true);
                inputElement.focus();
                return;
            }

            if (!window.crypto || !window.crypto.subtle) {
                updateDevPassHint('当前环境不支持口令校验。', true);
                return;
            }

            try {
                const msgUint8 = new TextEncoder().encode(input);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);

                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                if (inputHash === DEV_ACCESS_HASH) {
                    devAccessGranted = true;
                    closeDevMenu();
                    devSelectedUnit = units[gameState.currentUnit] ? gameState.currentUnit : 0;
                    switchScreen('adminScreen');
                    refreshDeveloperConsole('验证成功，开发者控制台已就绪。');
                } else {
                    inputElement.value = '';
                    updateDevPassHint('口令错误，请重新输入。', true);
                    inputElement.focus();
                }
            } catch (error) {
                console.warn('开发者口令校验失败。', error);
                updateDevPassHint('口令校验失败，请在受支持的浏览器环境中重试。', true);
            }
        }

        function updateAdminStatus(msg) {
            const status = document.getElementById('adminStatus');
            if (!status) return;
            const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
            status.textContent = `${time} · ${msg}`;
        }

        function devSelectUnit(unitIndex) {
            if (!units[unitIndex]) return;
            devSelectedUnit = unitIndex;
            refreshDeveloperConsole(`已切换到 ${getUnitDisplayName(unitIndex)}。`);
        }

        function devUnlockSelectedUnit() {
            unlockUnitProgress(devSelectedUnit);
            persistDeveloperChanges(`已解锁 ${getUnitDisplayName(devSelectedUnit)} 的全部关卡。`);
        }

        function devSetSelectedUnitMaxStars() {
            setUnitStars(devSelectedUnit, 3);
            persistDeveloperChanges(`已将 ${getUnitDisplayName(devSelectedUnit)} 设置为满星通关。`);
        }

        function devResetSelectedUnit() {
            if (!confirm(`确定要重置 ${units[devSelectedUnit].name} 的关卡进度吗？`)) {
                return;
            }

            resetUnitProgress(devSelectedUnit);
            persistDeveloperChanges(`已重置 ${getUnitDisplayName(devSelectedUnit)} 的关卡进度。`);
        }

        function devUnlockAllUnits() {
            units.forEach((_, unitIndex) => unlockUnitProgress(unitIndex));
            persistDeveloperChanges('已解锁全部单元的全部关卡。');
        }

        function devSetAllUnitsMaxStars() {
            units.forEach((_, unitIndex) => setUnitStars(unitIndex, 3));
            persistDeveloperChanges('已将全部单元设置为满星状态。');
        }

        function devResetAllProgress() {
            if (!confirm('确定要重置全部单元的关卡进度吗？此操作不会清除错题和统计。')) {
                return;
            }

            units.forEach((_, unitIndex) => resetUnitProgress(unitIndex));
            persistDeveloperChanges('已重置全部单元的关卡进度。');
        }

        function devUnlockAllAchievements() {
            gameState.achievements = achievementList.map(achievement => achievement.id);
            persistDeveloperChanges('已解锁全部成就。');
        }

        function devClearAchievements() {
            if (!confirm('确定要清空全部成就吗？')) {
                return;
            }

            gameState.achievements = [];
            persistDeveloperChanges('已清空全部成就。');
        }

        function devClearSelectedWrongQuestions() {
            const before = gameState.wrongQuestions.length;
            gameState.wrongQuestions = gameState.wrongQuestions.filter(item => item.unitIndex !== devSelectedUnit);
            const removed = before - gameState.wrongQuestions.length;
            persistDeveloperChanges(removed > 0
                ? `已清空 ${getUnitDisplayName(devSelectedUnit)} 的 ${removed} 条错题记录。`
                : `${getUnitDisplayName(devSelectedUnit)} 当前没有可清理的错题记录。`);
        }

        function devClearAllWrongQuestions() {
            if (!confirm('确定要清空全部错题记录吗？')) {
                return;
            }

            gameState.wrongQuestions = [];
            persistDeveloperChanges('已清空全部错题记录。');
        }

        function devResetStatsOnly() {
            if (!confirm('确定要仅重置统计数据吗？这会清零积分、做题数、修炼与极限记录。')) {
                return;
            }

            gameState.totalCorrect = 0;
            gameState.totalQuestions = 0;
            gameState.score = 0;
            gameState.practiceCount = 0;
            gameState.extremePasses = 0;
            gameState.extremeDualPasses = 0;
            persistDeveloperChanges('已重置统计数据，关卡与成就状态保持不变。');
        }

        function devResetEverything() {
            if (!confirm('确定要恢复默认存档吗？这会清空关卡、成就、错题和所有统计。')) {
                return;
            }

            units.forEach((_, unitIndex) => resetUnitProgress(unitIndex));
            gameState.achievements = [];
            gameState.wrongQuestions = [];
            gameState.totalCorrect = 0;
            gameState.totalQuestions = 0;
            gameState.score = 0;
            gameState.practiceCount = 0;
            gameState.extremePasses = 0;
            gameState.extremeDualPasses = 0;
            persistDeveloperChanges('已恢复默认存档。');
        }

        function closeAdminMenu() {
            showRecords();
        }

        // 初始化
        init();

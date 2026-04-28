const STORAGE_KEY = 'pythonOperatorGame';
        const STORAGE_VERSION = 3;
        const DEV_ACCESS_HASH = 'e18e010158ed9479ce5b953795a789a79ba6599b1b6e70528ed7b262f8681aa0';

        let storageStatusMessage = '尚未读取存档';
        let devAccessGranted = false;

        function getLevelsForUnit(unitIndex = gameState.currentUnit) {
            return unitLevelsMap[unitIndex] || unitLevelsMap[0];
        }

        function createDefaultUnitProgress(defaultValue) {
            return units.map((_, unitIndex) => Array(getLevelsForUnit(unitIndex).length).fill(defaultValue));
        }

        function createDefaultGameState() {
            return {
                currentUnit: 0,
                currentLevel: 0,
                currentQuestion: 0,
                lives: 3,
                score: 0,
                combo: 0,
                maxCombo: 0,
                levelScore: 0,
                levelCorrect: 0,
                levelTime: 0,
                questionStartTime: 0,
                selectedAnswer: null,
                isPracticeMode: false,
                practiceQuestionIndex: 0,
                unitLevelUnlocked: createDefaultUnitProgress(false).map(unitProgress =>
                    unitProgress.map((_, levelIndex) => levelIndex === 0)
                ),
                unitLevelStars: createDefaultUnitProgress(0),
                achievements: [],
                totalCorrect: 0,
                totalQuestions: 0,
                fastAnswer: false,
                fastStreak: 0,
                perfectLevel: false,
                oneLifeWin: false,
                practiceCount: 0,
                extremePasses: 0,
                extremeDualPasses: 0,
                pendingMode: 'adventure',
                isPaused: false,
                wrongQuestions: [],
                wrongAnalysisUnit: 0,
                isExtremeMode: false,
                extremeScope: null,
                extremeSegments: [],
                extremeSegmentIndex: 0,
                extremeRunCorrect: 0,
                extremeRunAttempted: 0,
                isAnswerLocked: false
            };
        }

        function formatMultilineCodeBlocks(container) {
            if (!container) {
                return;
            }

            container.querySelectorAll('code').forEach(code => {
                const isMultiline = code.innerHTML.includes('<br>') || code.textContent.includes('\n');
                code.classList.toggle('multiline-code', isMultiline);
            });
        }

        function shuffleQuestions(questionList) {
            const shuffled = [...questionList];

            for (let index = shuffled.length - 1; index > 0; index--) {
                const randomIndex = Math.floor(Math.random() * (index + 1));
                [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
            }

            return shuffled;
        }

        function hasNonEmptyAnswer(answer) {
            return String(answer ?? '').trim() !== '';
        }

        function handleAdventureFillKeydown(event) {
            if (event.key !== 'Enter' || event.isComposing || !hasNonEmptyAnswer(event.target.value)) {
                return;
            }

            event.preventDefault();
            submitAnswer();
        }

        function handlePracticeFillKeydown(event) {
            if (event.key !== 'Enter' || event.isComposing || !hasNonEmptyAnswer(event.target.value)) {
                return;
            }

            event.preventDefault();
            submitPracticeAnswer();
        }

        function focusInputSoon(inputId) {
            window.setTimeout(() => {
                const input = document.getElementById(inputId);
                if (!input) {
                    return;
                }

                input.focus();
                if (typeof input.select === 'function') {
                    input.select();
                }
            }, 50);
        }

        function handleChoiceCardKeypress(event, answer, element) {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();
            clickChoiceSubmit(answer, element);
        }

        function handleJudgeCardKeypress(event, answer, element) {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();
            clickJudgeSubmit(answer, element);
        }

        function handlePracticeChoiceCardKeypress(event, answer, element) {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();
            practiceClickSubmit('choice', answer, element);
        }

        function handlePracticeJudgeCardKeypress(event, answer, element) {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();
            practiceClickSubmit('judge', answer, element);
        }

        function getDefaultWrongAnalysisUnit() {
            const firstWrong = gameState.wrongQuestions.find(item => units[item.unitIndex]);
            return firstWrong ? firstWrong.unitIndex : 0;
        }

        function isGuidedLearningMode() {
            return !gameState.isExtremeMode && !gameState.isPracticeMode;
        }

        function getQuestionTimeLimitSeconds() {
            if (gameState.isExtremeMode) {
                return 10;
            }

            if (isGuidedLearningMode()) {
                return 60;
            }

            return 15;
        }

        function getMaxLivesForCurrentMode() {
            if (gameState.isExtremeMode) {
                return 1;
            }

            if (isGuidedLearningMode()) {
                return 5;
            }

            return 3;
        }

        function isUnitFullyCleared(unitIndex) {
            const unitLevels = getLevelsForUnit(unitIndex);
            const unitStars = gameState.unitLevelStars[unitIndex] || [];
            return unitLevels.length > 0 && unitLevels.every((_, levelIndex) => (unitStars[levelIndex] || 0) > 0);
        }

        function getRecommendedUnitIndex() {
            const nextUnitIndex = units.findIndex((_, unitIndex) => !isUnitFullyCleared(unitIndex));
            return nextUnitIndex === -1 ? Math.max(units.length - 1, 0) : nextUnitIndex;
        }

        function getRecommendedLevelIndex(unitIndex = getRecommendedUnitIndex()) {
            const unitLevels = getLevelsForUnit(unitIndex);
            const unlocked = gameState.unitLevelUnlocked[unitIndex] || [];
            const stars = gameState.unitLevelStars[unitIndex] || [];
            const nextUnclearedIndex = unitLevels.findIndex((_, levelIndex) => unlocked[levelIndex] && (stars[levelIndex] || 0) === 0);

            if (nextUnclearedIndex !== -1) {
                return nextUnclearedIndex;
            }

            const furthestUnlockedIndex = unlocked.lastIndexOf(true);
            return furthestUnlockedIndex === -1 ? 0 : furthestUnlockedIndex;
        }

        function getContinueLearningTarget() {
            const unitIndex = getRecommendedUnitIndex();
            const levelIndex = getRecommendedLevelIndex(unitIndex);
            const unit = units[unitIndex] || units[0];
            const level = getLevelsForUnit(unitIndex)[levelIndex] || getLevelsForUnit(unitIndex)[0];

            return {
                unitIndex,
                levelIndex,
                unit,
                level
            };
        }

        function renderContinueLearningCard() {
            const container = document.getElementById('continueLearningCard');
            if (!container) {
                return;
            }

            const target = getContinueLearningTarget();
            const totalStars = gameState.unitLevelStars.reduce((sum, unitStars) => sum + unitStars.reduce((unitSum, stars) => unitSum + stars, 0), 0);
            const unlockedBeyondFirst = gameState.unitLevelUnlocked.some(unitUnlocked => unitUnlocked.filter(Boolean).length > 1);
            const hasProgress = gameState.totalQuestions > 0 || totalStars > 0 || unlockedBeyondFirst;

            container.innerHTML = `
                <section class="continue-learning-card">
                    <div>
                        <span class="continue-learning-kicker">${hasProgress ? '继续上次学习' : '推荐起点'}</span>
                        <h2 class="continue-learning-title">${hasProgress ? `${target.unit.name} · 第${target.levelIndex + 1}关` : '直接从第一课开始'}</h2>
                        <p class="continue-learning-copy">${hasProgress ? `你最适合继续学习 ${target.level.name}。已经学过的内容不用重头找，直接回到当前最该学的地方。` : '如果你完全没有基础，就从第一单元第一关开始。这里只要求你一步一步照着提示学。'}</p>
                        <div class="continue-learning-meta">${hasProgress ? `累计已练 ${gameState.totalQuestions} 题 · 已拿 ${totalStars} 颗星` : '新手保护：每题 60 秒、5 颗爱心、答错先看讲解。'}</div>
                    </div>
                    <button class="continue-btn continue-btn--home" onclick="continueLearningJourney()">${hasProgress ? `继续：${target.level.name}` : '开始第一课'}</button>
                </section>
            `;
        }

        function continueLearningJourney() {
            resetExtremeMode();
            gameState.pendingMode = 'adventure';
            gameState.isPracticeMode = false;

            const target = getContinueLearningTarget();
            gameState.currentUnit = target.unitIndex;
            startLevel(target.levelIndex);
        }

        function renderLearningPathPanel() {
            const panel = document.getElementById('learningPathPanel');
            const subtitle = document.getElementById('unitSelectSubtitle');
            const isPracticeSelection = gameState.pendingMode === 'practice';

            if (subtitle) {
                subtitle.textContent = isPracticeSelection
                    ? '先挑一个单元查漏补缺，再进入随机练习。'
                    : '按推荐顺序学习，会比随机跳关更容易把基础打牢。';
            }

            if (!panel) {
                return;
            }

            const recommendedUnitIndex = getRecommendedUnitIndex();

            panel.innerHTML = `
                <section class="learning-route-panel learning-route-panel--select">
                    <span class="learning-route-kicker">${isPracticeSelection ? '补基础路线' : '新手推荐路线'}</span>
                    <h2 class="learning-route-title">${isPracticeSelection ? '修炼场前，建议先补这一站' : '现在最适合先学什么'}</h2>
                    <p class="learning-route-copy">${isPracticeSelection ? '先把推荐单元前几关过一遍，再去随机练，正确率会更稳定。' : '系统按“运算符 → 条件判断 → 循环”递进，新手照这个顺序最容易吸收。'}</p>
                    <div class="route-track">
                        ${units.map((unit, unitIndex) => {
                            const isRecommended = unitIndex === recommendedUnitIndex;
                            const isDone = isUnitFullyCleared(unitIndex);
                            const statusText = isDone
                                ? '已通关，可回顾'
                                : isRecommended
                                    ? '建议现在学习'
                                    : '建议排在后面';

                            return `
                                <article class="route-track-item ${isRecommended ? 'route-track-item--active' : ''} ${isDone ? 'route-track-item--done' : ''}">
                                    <div class="route-track-head">
                                        <span class="route-track-index">${unitIndex + 1}</span>
                                        <span class="route-track-status">${statusText}</span>
                                    </div>
                                    <h3>${unit.name}</h3>
                                    <p>${unit.learningGoal || unit.description}</p>
                                    <div class="route-track-note">${unit.starterTip || '按顺序学习会更轻松。'}</div>
                                </article>
                            `;
                        }).join('')}
                    </div>
                </section>
            `;
        }

        // 游戏状态
        let gameState = createDefaultGameState();

        let devMenuClickCount = 0;
        let devMenuClickTimer = null;
        let timerInterval = null;
        let currentLevelQuestions = [];
        let devSelectedUnit = 0;
        let achievementPopupQueue = [];
        let achievementPopupActive = false;

        // 渲染单元选择卡片
        function renderUnits() {
            const container = document.getElementById('unitsContainer');
            const recommendedUnitIndex = getRecommendedUnitIndex();

            renderLearningPathPanel();
            container.innerHTML = units.map((unit, idx) => {
                const unitLevels = getLevelsForUnit(idx);
                const stars = gameState.unitLevelStars[idx].reduce((a, b) => a + b, 0);
                const totalStars = unitLevels.length * 3;
                const unlockedCount = gameState.unitLevelUnlocked[idx].filter(Boolean).length;
                const isRecommended = idx === recommendedUnitIndex;
                const isCleared = isUnitFullyCleared(idx);
                const routeLabel = isCleared
                    ? '已通关'
                    : isRecommended
                        ? (gameState.pendingMode === 'practice' ? '建议先补这里' : '推荐当前学习')
                        : idx < recommendedUnitIndex
                            ? '适合复习'
                            : '建议后学';

                return `
                    <div class="unit-card ${isRecommended ? 'unit-card--recommended' : ''}" onclick="chooseUnit(${idx})">
                        <div class="unit-card-badges">
                            <span class="unit-badge ${isRecommended ? 'unit-badge--recommended' : isCleared ? 'unit-badge--done' : ''}">${routeLabel}</span>
                        </div>
                        <div class="unit-icon">${unit.icon}</div>
                        <div class="unit-title">${unit.name}</div>
                        <div class="unit-subtitle">${unit.subtitle}</div>
                        <div class="unit-desc">${unit.description}</div>
                        <div class="unit-card-tip">${unit.learningGoal || ''}</div>
                        <div class="unit-card-tip unit-card-tip--muted">${unit.starterTip || ''}</div>
                        <div class="unit-progress">已解锁 ${unlockedCount}/${unitLevels.length} 关 ・ ⭐ ${stars}/${totalStars}</div>
                    </div>
                `;
            }).join('');
        }

        // 选择单元
        function chooseUnit(unitIndex) {
            gameState.currentUnit = unitIndex;
            if (gameState.pendingMode === 'practice') {
                openPracticeMode();
                return;
            }
            renderLevelMap();
            switchScreen('levelSelectScreen');
        }

        // 显示单元选择界面
        function selectUnit() {
            renderUnits();
            switchScreen('unitSelectScreen');
        }

        // 初始化
        function init() {
            loadGameState();
            createParticles();
            renderContinueLearningCard();
            renderUnits();
            renderAchievements();
            refreshDeveloperConsole();
        }

        // 创建粒子效果
        function createParticles() {
            const container = document.getElementById('particles');
            container.innerHTML = '';
            for (let i = 0; i < 28; i++) {
                const particle = document.createElement('div');
                const size = 6 + Math.random() * 10;
                const duration = 10 + Math.random() * 10;
                const delay = Math.random() * 12;
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.setProperty('--particle-size', `${size}px`);
                particle.style.setProperty('--particle-opacity', (0.2 + Math.random() * 0.5).toFixed(2));
                particle.style.setProperty('--particle-shift-start', `${(-20 + Math.random() * 40).toFixed(1)}px`);
                particle.style.setProperty('--particle-shift-end', `${(-80 + Math.random() * 160).toFixed(1)}px`);
                particle.style.setProperty('--particle-delay', `${delay.toFixed(2)}s`);
                particle.style.setProperty('--particle-duration', `${duration.toFixed(2)}s`);
                container.appendChild(particle);
            }
        }

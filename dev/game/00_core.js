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
            container.innerHTML = units.map((unit, idx) => {
                const unitLevels = getLevelsForUnit(idx);
                const stars = gameState.unitLevelStars[idx].reduce((a, b) => a + b, 0);
                const totalStars = unitLevels.length * 3;
                const unlockedCount = gameState.unitLevelUnlocked[idx].filter(Boolean).length;

                return `
                    <div class="unit-card" onclick="chooseUnit(${idx})">
                        <div class="unit-icon">${unit.icon}</div>
                        <div class="unit-title">${unit.name}</div>
                        <div class="unit-subtitle">${unit.subtitle}</div>
                        <div class="unit-desc">${unit.description}</div>
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

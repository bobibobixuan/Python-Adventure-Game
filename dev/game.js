// 当前选中的单元
        let currentUnit = 0;

        function getLevelsForUnit(unitIndex = gameState.currentUnit) {
            return unitLevelsMap[unitIndex] || unitLevelsMap[0];
        }

        // 游戏状态
        let gameState = {
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
            unitLevelUnlocked: [[true, false, false, false, false, false], [true, false, false, false, false, false]],
            unitLevelStars: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]],
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
            levelLivesAtStart: 3,
            isPaused: false,
            wrongQuestions: [],
            wrongAnalysisUnit: 0,
            isExtremeMode: false,
            extremeScope: null,
            extremeSegments: [],
            extremeSegmentIndex: 0
        };

        let devMenuClickCount = 0;
        let devMenuClickTimer = null;
        let timerInterval = null;
        let currentLevelQuestions = [];
        let devSelectedUnit = 0;

        const DEV_ACCESS_HASH = 'e18e010158ed9479ce5b953795a789a79ba6599b1b6e70528ed7b262f8681aa0';

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
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = (10 + Math.random() * 10) + 's';
                container.appendChild(particle);
            }
        }

        function createDefaultUnitProgress(defaultValue) {
            return units.map((_, unitIndex) => Array(getLevelsForUnit(unitIndex).length).fill(defaultValue));
        }

        function normalizeUnitProgress(savedProgress, fallbackValue) {
            const defaultProgress = createDefaultUnitProgress(fallbackValue);

            if (!Array.isArray(savedProgress)) {
                return defaultProgress;
            }

            return units.map((_, unitIndex) => {
                const unitProgress = savedProgress[unitIndex];
                const unitLevels = getLevelsForUnit(unitIndex);
                if (!Array.isArray(unitProgress)) {
                    return [...defaultProgress[unitIndex]];
                }

                return unitLevels.map((__, levelIndex) => {
                    const value = unitProgress[levelIndex];
                    return value === undefined ? defaultProgress[unitIndex][levelIndex] : value;
                });
            });
        }

        function swapUnitOrder(progressList) {
            if (!Array.isArray(progressList) || progressList.length < 2) {
                return progressList;
            }

            return [progressList[1], progressList[0], ...progressList.slice(2)];
        }

        function getTotalStars() {
            return gameState.unitLevelStars.reduce(
                (sum, unitStars) => sum + unitStars.reduce((unitSum, stars) => unitSum + stars, 0),
                0
            );
        }

        function getCompletedUnitCount() {
            return units.filter((_, unitIndex) => {
                const unitStars = gameState.unitLevelStars[unitIndex] || [];
                return unitStars.length > 0 && unitStars.every(stars => stars > 0);
            }).length;
        }

        function buildAchievementStats(overrides = {}) {
            return Object.assign({
                fastAnswer: gameState.fastAnswer,
                maxCombo: gameState.maxCombo,
                perfectLevel: gameState.perfectLevel,
                allLevelsClear: false,
                oneLifeWin: gameState.lives === 1,
                practiceCount: gameState.practiceCount,
                fastStreak: gameState.fastStreak,
                perfectStreak: gameState.levelCorrect === currentLevelQuestions.length && currentLevelQuestions.length > 0,
                totalCorrect: gameState.totalCorrect,
                totalQuestions: gameState.totalQuestions,
                totalStars: getTotalStars(),
                completedUnits: getCompletedUnitCount(),
                totalUnits: units.length,
                score: gameState.score,
                extremePasses: gameState.extremePasses,
                extremeDualPasses: gameState.extremeDualPasses
            }, overrides);
        }

        function getUnitDisplayName(unitIndex) {
            const rawName = units[unitIndex] ? units[unitIndex].name : `第${unitIndex + 1}单元`;
            return rawName.split(/[：:]/)[0].trim();
        }

        function getQuestionMetaById(questionId) {
            for (const [unitKey, questionList] of Object.entries(unitQuestionsMap)) {
                const question = questionList.find(item => item.id === questionId);
                if (question) {
                    const unitIndex = Number(unitKey);
                    const levels = getLevelsForUnit(unitIndex);
                    const levelIndex = Number(question.categoryId || 0);
                    const level = levels[levelIndex] || levels[0];
                    return {
                        question,
                        unitIndex,
                        unitName: units[unitIndex].name,
                        unitDisplayName: getUnitDisplayName(unitIndex),
                        levelIndex,
                        levelName: level ? level.name : question.category
                    };
                }
            }

            return null;
        }

        function enrichWrongQuestionRecord(record) {
            const meta = getQuestionMetaById(record.id);
            if (!meta) {
                return Object.assign({}, record, {
                    unitIndex: Number(record.unitIndex || 0),
                    levelIndex: Number(record.levelIndex || 0),
                    unitName: record.unitName || units[0].name,
                    levelName: record.levelName || record.category || '未知关卡',
                    sourceLabel: `[${getUnitDisplayName(Number(record.unitIndex || 0))} - ${record.levelName || record.category || '未知关卡'}]`
                });
            }

            return Object.assign({}, record, {
                unitIndex: meta.unitIndex,
                levelIndex: meta.levelIndex,
                unitName: meta.unitName,
                levelName: meta.levelName,
                sourceLabel: `[${meta.unitDisplayName} - ${meta.levelName}]`
            });
        }

        function createWrongQuestionRecord(question, userAnswer) {
            const level = getLevelsForUnit(gameState.currentUnit)[gameState.currentLevel];
            return {
                id: question.id,
                category: question.category,
                type: question.type,
                content: question.content,
                answer: question.answer,
                userAnswer: userAnswer,
                timestamp: new Date().toLocaleString(),
                knowledge: question.knowledge,
                unitIndex: gameState.currentUnit,
                levelIndex: gameState.currentLevel,
                unitName: units[gameState.currentUnit].name,
                levelName: level ? level.name : question.category,
                sourceLabel: `[${getUnitDisplayName(gameState.currentUnit)} - ${level ? level.name : question.category}]`
            };
        }

        function resetExtremeMode() {
            gameState.isExtremeMode = false;
            gameState.extremeScope = null;
            gameState.extremeSegments = [];
            gameState.extremeSegmentIndex = 0;
        }

        function getExtremeSegments(scope) {
            if (scope === 'unit0') {
                return getLevelsForUnit(0).map((_, levelIndex) => ({ unitIndex: 0, levelIndex }));
            }
            if (scope === 'unit1') {
                return getLevelsForUnit(1).map((_, levelIndex) => ({ unitIndex: 1, levelIndex }));
            }

            const firstUnitSegments = getLevelsForUnit(0).map((_, levelIndex) => ({ unitIndex: 0, levelIndex }));
            const secondUnitSegments = getLevelsForUnit(1).map((_, levelIndex) => ({ unitIndex: 1, levelIndex }));
            return firstUnitSegments.concat(secondUnitSegments);
        }

        function getExtremeScopeLabel(scope = gameState.extremeScope) {
            if (scope === 'unit0') return '极限测试 · 第一单元';
            if (scope === 'unit1') return '极限测试 · 第二单元';
            return '极限测试 · 双单元综合大考';
        }

        function unlockAchievements(stats) {
            const newAchievements = [];

            achievementList.forEach(achievement => {
                if (!gameState.achievements.includes(achievement.id) && achievement.condition(stats)) {
                    gameState.achievements.push(achievement.id);
                    newAchievements.push(achievement);
                    showAchievementPopup(achievement);
                }
            });

            return newAchievements;
        }

        // 加载游戏状态
        function loadGameState() {
            const saved = localStorage.getItem('pythonOperatorGame');
            if (saved) {
                const data = JSON.parse(saved);
                let migrated = false;
                const legacyLevels = getLevelsForUnit(0);

                if (Array.isArray(data.levelUnlocked) && !Array.isArray(data.unitLevelUnlocked)) {
                    data.unitLevelUnlocked = createDefaultUnitProgress(false);
                    data.unitLevelUnlocked[0] = legacyLevels.map((_, levelIndex) => Boolean(data.levelUnlocked[levelIndex]));
                    migrated = true;
                }

                if (Array.isArray(data.levelStars) && !Array.isArray(data.unitLevelStars)) {
                    data.unitLevelStars = createDefaultUnitProgress(0);
                    data.unitLevelStars[0] = legacyLevels.map((_, levelIndex) => Number(data.levelStars[levelIndex] || 0));
                    migrated = true;
                }

                if (data.levelUnlocked !== undefined) {
                    delete data.levelUnlocked;
                    migrated = true;
                }

                if (data.levelStars !== undefined) {
                    delete data.levelStars;
                    migrated = true;
                }

                gameState.unitLevelUnlocked = normalizeUnitProgress(data.unitLevelUnlocked, false);
                gameState.unitLevelUnlocked = gameState.unitLevelUnlocked.map((unitProgress, unitIndex) =>
                    unitProgress.map((isUnlocked, levelIndex) => levelIndex === 0 ? true : Boolean(isUnlocked))
                );
                gameState.unitLevelStars = normalizeUnitProgress(data.unitLevelStars, 0).map(unitProgress =>
                    unitProgress.map(stars => Math.max(0, Number(stars) || 0))
                );
                if ((data.unitOrderVersion || 1) < 2) {
                    gameState.unitLevelUnlocked = swapUnitOrder(gameState.unitLevelUnlocked);
                    gameState.unitLevelStars = swapUnitOrder(gameState.unitLevelStars);
                    migrated = true;
                }
                gameState.achievements = data.achievements || [];
                gameState.wrongQuestions = Array.isArray(data.wrongQuestions)
                    ? data.wrongQuestions.map(enrichWrongQuestionRecord)
                    : [];
                gameState.totalCorrect = Number(data.totalCorrect || 0);
                gameState.totalQuestions = Number(data.totalQuestions || 0);
                gameState.score = Number(data.score || 0);
                gameState.practiceCount = Number(data.practiceCount || 0);
                gameState.extremePasses = Number(data.extremePasses || 0);
                gameState.extremeDualPasses = Number(data.extremeDualPasses || 0);

                if (migrated) {
                    saveGameState();
                }
            }
        }

        // 保存游戏状态
        function saveGameState() {
            localStorage.setItem('pythonOperatorGame', JSON.stringify({
                unitOrderVersion: 2,
                unitLevelUnlocked: gameState.unitLevelUnlocked,
                unitLevelStars: gameState.unitLevelStars,
                achievements: gameState.achievements,
                wrongQuestions: gameState.wrongQuestions,
                totalCorrect: gameState.totalCorrect,
                totalQuestions: gameState.totalQuestions,
                score: gameState.score,
                practiceCount: gameState.practiceCount,
                extremePasses: gameState.extremePasses,
                extremeDualPasses: gameState.extremeDualPasses
            }));
        }

        // 显示开始界面
        function showStartScreen() {
            stopTimer();
            gameState.pendingMode = 'adventure';
            gameState.isPracticeMode = false;
            resetExtremeMode();
            switchScreen('startScreen');
            document.getElementById('statusBar').classList.add('hidden');
        }

        // 切换界面
        function switchScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(screenId).classList.add('active');
        }

        // 开始冒险
        function startAdventure() {
            gameState.pendingMode = 'adventure';
            gameState.isPracticeMode = false;
            resetExtremeMode();
            selectUnit();
        }

        function showExtremeModeSelect() {
            gameState.pendingMode = 'adventure';
            gameState.isPracticeMode = false;
            resetExtremeMode();
            switchScreen('extremeModeScreen');
        }

        function startExtremeTest(scope) {
            gameState.pendingMode = 'adventure';
            gameState.isPracticeMode = false;
            gameState.isExtremeMode = true;
            gameState.extremeScope = scope;
            gameState.extremeSegments = getExtremeSegments(scope);
            gameState.extremeSegmentIndex = 0;

            if (gameState.extremeSegments.length === 0) {
                showStartScreen();
                return;
            }

            const firstSegment = gameState.extremeSegments[0];
            gameState.currentUnit = firstSegment.unitIndex;
            startLevel(firstSegment.levelIndex);
        }

        function openPracticeMode() {
            gameState.isPracticeMode = true;
            gameState.practiceQuestionIndex = 0;

            const unitQuestions = unitQuestionsMap[gameState.currentUnit];
            currentLevelQuestions = [...unitQuestions].sort(() => Math.random() - 0.5);

            document.getElementById('practiceTitle').textContent = `${units[gameState.currentUnit].name} · 随机练习`;
            switchScreen('practiceScreen');
            renderPracticeQuestion();
        }

        // 渲染关卡地图
        function renderLevelMap() {
            const mapPath = document.getElementById('mapPath');
            const unit = units[gameState.currentUnit];
            const activeLevels = getLevelsForUnit();
            const mapTitle = document.querySelector('.map-title');
            if (mapTitle) {
                mapTitle.textContent = `🗺️ ${unit.name} 地图`;
            }
            
            mapPath.innerHTML = activeLevels.map((level, idx) => {
                const isUnlocked = gameState.unitLevelUnlocked[gameState.currentUnit][idx];
                const stars = gameState.unitLevelStars[gameState.currentUnit][idx];
                const starsStr = stars > 0 ? '⭐'.repeat(stars) : '';

                return `
                    <div class="map-node ${isUnlocked ? 'unlocked' : 'locked'} ${stars === 3 ? 'completed' : ''}"
                         onclick="${isUnlocked ? `startLevel(${idx})` : ''}">
                        <span class="map-node-icon">${level.icon}</span>
                        <span class="map-node-name">${level.name}</span>
                        <span class="map-node-stars">${starsStr}</span>
                    </div>
                `;
            }).join('');
        }

        // 开始关卡
        function startLevel(levelIndex) {
            gameState.currentLevel = levelIndex;
            gameState.currentQuestion = 0;
            gameState.lives = gameState.isExtremeMode ? 1 : 3;
            gameState.levelScore = 0;
            gameState.levelCorrect = 0;
            gameState.levelTime = 0;
            gameState.combo = 0;
            gameState.maxCombo = 0;
            gameState.fastStreak = 0;
            gameState.perfectLevel = true;
            gameState.levelLivesAtStart = gameState.lives;
            gameState.fastAnswer = false;

            // 获取该单元该关卡的题目
            const unitQuestions = unitQuestionsMap[gameState.currentUnit];
            currentLevelQuestions = unitQuestions.filter(q => q.categoryId === levelIndex);

            // 更新UI
            document.getElementById('statusBar').classList.remove('hidden');
            updateLivesDisplay();
            updateScoreDisplay();
            updateComboDisplay();

            switchScreen('gameScreen');
            renderLevelHeader();
            renderQuestion();
            startTimer();
        }

        // 渲染关卡头部
        function renderLevelHeader() {
            const level = getLevelsForUnit()[gameState.currentLevel];
            document.getElementById('levelBg').textContent = level.bg;
            if (gameState.isExtremeMode) {
                const segmentText = `${gameState.extremeSegmentIndex + 1}/${gameState.extremeSegments.length}`;
                document.getElementById('levelTitle').textContent = `${getExtremeScopeLabel()} · 第${segmentText}段：${level.name}`;
                document.getElementById('levelIndicator').textContent = `考核 ${segmentText}`;
            } else {
                document.getElementById('levelTitle').textContent = `第${gameState.currentLevel + 1}关：${level.name}`;
                document.getElementById('levelIndicator').textContent = `第${gameState.currentLevel + 1}关`;
            }
        }

        // 渲染题目
        function renderQuestion() {
            const q = currentLevelQuestions[gameState.currentQuestion];

            document.getElementById('questionType').textContent = q.type;
            document.getElementById('questionProgress').textContent =
                `${gameState.currentQuestion + 1} / ${currentLevelQuestions.length}`;
            document.getElementById('questionContent').innerHTML = q.content;

            const optionsContainer = document.getElementById('optionsContainer');
            gameState.selectedAnswer = null;
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('submitBtn').style.display = 'block';

            // 清除旧的答题反馈效果
            const questionCard = document.querySelector('.question-card');
            if (questionCard) {
                questionCard.classList.remove('answered-correct', 'answered-wrong');
                const feedback = questionCard.querySelector('.answer-feedback');
                if (feedback) feedback.remove();
                const tip = questionCard.querySelector('.correct-answer-tip');
                if (tip) tip.remove();
            }

            if (q.type === '选择题') {
                optionsContainer.innerHTML = `
                    <div class="options-grid">
                        ${q.options.map(opt => `
                            <div class="option-card" onclick="clickChoiceSubmit('${opt.letter}', this)">
                                <span class="option-letter">${opt.letter}</span>
                                <span>${opt.text}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else if (q.type === '判断题') {
                optionsContainer.innerHTML = `
                    <div class="judge-options">
                        <div class="judge-card true-btn" onclick="clickJudgeSubmit('true', this)">
                            <div class="icon">✓</div>
                            <div>正确</div>
                        </div>
                        <div class="judge-card false-btn" onclick="clickJudgeSubmit('false', this)">
                            <div class="icon">✗</div>
                            <div>错误</div>
                        </div>
                    </div>
                `;
            } else if (q.type === '填空题') {
                optionsContainer.innerHTML = `
                    <div class="fill-blank">
                        <input type="text" class="fill-input" id="fillInput" 
                               placeholder="请输入答案" oninput="checkFillAnswer(this.value)">
                    </div>
                `;
            }

            gameState.questionStartTime = Date.now();
        }

        // 选择答案
        function selectAnswer(answer, element) {
            // 清除其他选中状态
            document.querySelectorAll('.option-card, .judge-card').forEach(el => {
                el.classList.remove('selected');
            });
            element.classList.add('selected');
            gameState.selectedAnswer = answer;
            document.getElementById('submitBtn').disabled = false;
        }

        // 冒险模式-选择题点击即提交
        function clickChoiceSubmit(answer, element) {
            // 禁用所有选项防止重复点击
            document.querySelectorAll('.option-card').forEach(el => {
                el.style.pointerEvents = 'none';
            });
            gameState.selectedAnswer = answer;
            submitAnswer();
        }

        // 冒险模式-判断题点击即提交
        function clickJudgeSubmit(answer, element) {
            // 禁用所有判断按钮防止重复点击
            document.querySelectorAll('.judge-card').forEach(el => {
                el.style.pointerEvents = 'none';
            });
            gameState.selectedAnswer = answer;
            submitAnswer();
        }

        // 检查填空答案
        function checkFillAnswer(value) {
            if (value.trim()) {
                gameState.selectedAnswer = value.trim();
                document.getElementById('submitBtn').disabled = false;
            } else {
                gameState.selectedAnswer = null;
                document.getElementById('submitBtn').disabled = true;
            }
        }
        // 提交答案
        function submitAnswer() {
            const q = currentLevelQuestions[gameState.currentQuestion];
            const userAnswer = gameState.selectedAnswer;
            const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(q.answer);

            // 计算用时
            const timeSpent = (Date.now() - gameState.questionStartTime) / 1000;
            gameState.levelTime += timeSpent;

            // 停止计时器
            stopTimer();

            // 检查是否快速答题
            if (isCorrect && timeSpent <= 5) {
                gameState.fastAnswer = true;
                gameState.fastStreak++;
            } else {
                gameState.fastStreak = 0;
            }

            let points = 0;
            let bonus = '';

            // 1. 更新分数与状态
            if (isCorrect) {
                points = 100;

                // 快速答题加成
                if (timeSpent <= 5) {
                    points += Math.floor((5 - timeSpent) * 20);
                    bonus = `⚡ 速度加成 +${Math.floor((5 - timeSpent) * 20)}`;
                }

                // 连击加成
                gameState.combo++;
                if (gameState.combo > 1) {
                    const comboBonus = Math.min(gameState.combo * 10, 50);
                    points += comboBonus;
                    bonus += bonus ? ` | 🔥 连击 +${comboBonus}` : `🔥 连击 +${comboBonus}`;
                }

                gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
                gameState.levelScore += points;
                gameState.levelCorrect++;
                gameState.totalCorrect++;
                gameState.score += points;

                showCorrectEffect();
                showFloatingCoins();
                showFloatingStars();
            } else {
                // 答错
                gameState.combo = 0;
                gameState.perfectLevel = false;
                gameState.lives--;
                gameState.fastStreak = 0;

                // 记录错误题
                const wrongRecord = createWrongQuestionRecord(q, userAnswer);
                if (!gameState.wrongQuestions.find(w => w.id === q.id)) {
                    gameState.wrongQuestions.push(wrongRecord);
                }

                showWrongEffect();
            }

            // 更新顶部UI
            updateScoreDisplay();
            updateComboDisplay();
            updateLivesDisplay();
            gameState.totalQuestions++;

            // 2. 立即在卡片上显示动画和对错反馈文字
            const questionCard = document.querySelector('.question-card');
            if (questionCard) {
                questionCard.classList.remove('answered-correct', 'answered-wrong');
                questionCard.classList.add(isCorrect ? 'answered-correct' : 'answered-wrong');

                const existingFeedback = questionCard.querySelector('.answer-feedback');
                if (existingFeedback) existingFeedback.remove();

                const feedback = document.createElement('div');
                feedback.className = `answer-feedback ${isCorrect ? 'correct' : 'wrong'}`;
                feedback.textContent = isCorrect ? '✓ 正确！' : '✗ 错误！';
                questionCard.appendChild(feedback);

                if (!isCorrect) {
                    const existingTip = questionCard.querySelector('.correct-answer-tip');
                    if (existingTip) existingTip.remove();

                    const tip = document.createElement('div');
                    tip.className = 'correct-answer-tip';
                    const correctAnswer = q.answer === 'true' ? '正确' : q.answer === 'false' ? '错误' : q.answer;
                    tip.innerHTML = `<strong>正确答案：${correctAnswer}</strong>`;
                    questionCard.appendChild(tip);
                }
            }

            highlightAnswer(q.answer, isCorrect);

            saveGameState();

            if (gameState.isExtremeMode && !isCorrect) {
                setTimeout(() => {
                    gameOver();
                }, 500);
                return;
            }

            // 3. 延迟 800 毫秒，让卡片飞一会儿，再弹出详细解析遮罩
            setTimeout(() => {
                showResult(isCorrect, points, bonus);
            }, 800);
        }

        // 标准化答案
        function normalizeAnswer(answer) {
            const str = String(answer).trim().toLowerCase();
            if (str === 'true' || str === 't') return 'true';
            if (str === 'false' || str === 'f') return 'false';
            return str;
        }

        // 显示结果
        function showResult(isCorrect, points, bonus) {
            const overlay = document.getElementById('resultOverlay');
            const icon = document.getElementById('resultIcon');
            const title = document.getElementById('resultTitle');
            const scoreDiv = document.getElementById('resultScore');
            const bonusDiv = document.getElementById('resultBonus');
            const knowledgeBox = document.getElementById('knowledgeBox');

            icon.textContent = isCorrect ? '✓' : '✗';
            icon.style.fontSize = isCorrect ? '80px' : '80px';
            title.className = `result-title ${isCorrect ? 'correct' : 'wrong'}`;
            title.textContent = isCorrect ? '回答正确！🎉' : '回答错误';

            scoreDiv.textContent = isCorrect ? `+${points}` : '+0';
            scoreDiv.style.display = isCorrect ? 'block' : 'none';
            bonusDiv.textContent = bonus;
            bonusDiv.style.display = bonus ? 'block' : 'none';

            const q = currentLevelQuestions[gameState.currentQuestion];
            const k = q.knowledge;
            knowledgeBox.innerHTML = `
                <h4>📚 知识点解析</h4>
                <p><strong>运算符含义：</strong>${k.meaning}</p>
                <p><strong>运算规则：</strong>${k.rule}</p>
                <p><strong>常见易错点：</strong>${k.error}</p>
                <p><strong>相关示例：</strong>${k.example}</p>
            `;

            overlay.classList.add('show');
        }

        function closeResult() {
            document.getElementById('resultOverlay').classList.remove('show');
            if (gameState.lives <= 0) {
                gameOver();
                return;
            }
            if (gameState.currentQuestion >= currentLevelQuestions.length - 1) {
                levelComplete();
            } else {
                gameState.currentQuestion++;
                renderQuestion();
                startTimer();
            }
        }

        // 高亮答案
        function highlightAnswer(correctAnswer, wasCorrect) {
            const options = document.querySelectorAll('.option-card');
            const judges = document.querySelectorAll('.judge-card');

            if (options.length > 0) {
                options.forEach(opt => {
                    const letter = opt.querySelector('.option-letter').textContent;
                    if (letter === correctAnswer) {
                        opt.classList.add('correct');
                    } else if (opt.classList.contains('selected') && !wasCorrect) {
                        opt.classList.add('wrong');
                    }
                });
            }

            if (judges.length > 0) {
                judges.forEach(btn => {
                    const isTrueBtn = btn.classList.contains('true-btn');
                    const shouldBeTrue = correctAnswer === 'true';
                    if (isTrueBtn === shouldBeTrue) {
                        btn.classList.add('correct');
                    } else if (btn.classList.contains('selected') && !wasCorrect) {
                        btn.classList.add('wrong');
                    }
                });
            }

            // 填空题答案显示
            if (document.getElementById('fillInput')) {
                const input = document.getElementById('fillInput');
                if (!wasCorrect) {
                    input.style.borderColor = '#ff4757';
                } else {
                    input.style.borderColor = '#00ff88';
                }
            }

            document.getElementById('submitBtn').style.display = 'none';
        }

        // 显示正确效果
        function showCorrectEffect() {
            const icon = document.getElementById('resultIcon');
            icon.style.animation = 'correctPulse 0.5s ease';
        }

        // 显示错误效果
        function showWrongEffect() {
            // 伤害效果
            const damage = document.createElement('div');
            damage.className = 'damage-effect';
            document.body.appendChild(damage);
            setTimeout(() => damage.remove(), 500);

            // 生命值动画
            const lives = document.querySelectorAll('.life:not(.lost)');
            if (lives.length > 0) {
                lives[lives.length - 1].classList.add('damage');
                setTimeout(() => {
                    lives[lives.length - 1].classList.add('lost');
                    lives[lives.length - 1].classList.remove('damage');
                }, 500);
            }
        }

        // 显示漂浮金币
        function showFloatingCoins() {
            const container = document.getElementById('floatingCoins');
            for (let i = 0; i < 5; i++) {
                const coin = document.createElement('div');
                coin.className = 'coin';
                coin.textContent = '🪙';
                coin.style.left = (50 + (Math.random() - 0.5) * 30) + '%';
                coin.style.top = '50%';
                coin.style.animationDelay = (i * 0.1) + 's';
                container.appendChild(coin);
                setTimeout(() => coin.remove(), 1000);
            }
        }

        // 显示漂浮星星
        function showFloatingStars() {
            const container = document.getElementById('floatingStars');
            for (let i = 0; i < 3; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.textContent = '⭐';
                star.style.left = (40 + Math.random() * 20) + '%';
                star.style.top = '40%';
                star.style.animationDelay = (i * 0.15) + 's';
                container.appendChild(star);
                setTimeout(() => star.remove(), 800);
            }
        }

        // 更新生命显示
        function updateLivesDisplay() {
            const container = document.getElementById('livesContainer');
            let html = '';
            for (let i = 0; i < 3; i++) {
                const lost = i >= gameState.lives ? 'lost' : '';
                html += `<span class="life ${lost}">💖</span>`;
            }
            container.innerHTML = html;
        }

        // 更新分数显示
        function updateScoreDisplay() {
            document.getElementById('scoreDisplay').textContent = gameState.score;
        }

        // 更新连击显示
        function updateComboDisplay() {
            const display = document.getElementById('comboDisplay');
            const count = document.getElementById('comboCount');
            if (gameState.combo >= 2) {
                display.style.display = 'flex';
                count.textContent = gameState.combo;
            } else {
                display.style.display = 'none';
            }
        }

        // 开始计时器
        function startTimer() {
            let timeLeft = 100;
            const fill = document.getElementById('timerFill');
            fill.style.width = '100%';
            fill.className = 'timer-fill';

            if (timerInterval) clearInterval(timerInterval);

            timerInterval = setInterval(() => {
                if (gameState.isPaused) return;

                timeLeft -= 1;
                fill.style.width = timeLeft + '%';

                if (timeLeft <= 30) {
                    fill.className = 'timer-fill danger';
                } else if (timeLeft <= 50) {
                    fill.className = 'timer-fill warning';
                }
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    if (!gameState.selectedAnswer) {
                        gameState.selectedAnswer = '';
                    }
                    submitAnswer(); // 挪到 if 语句外面
                }
            }, 100);
        }

        // 停止计时器
        function stopTimer() {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }

        // 关卡完成
        function levelComplete() {
            stopTimer();
            if (gameState.isExtremeMode) {
                handleExtremeLevelComplete();
                return;
            }

            const activeLevels = getLevelsForUnit();

            const avgTime = (gameState.levelTime / currentLevelQuestions.length).toFixed(1);
            const correctRate = `${gameState.levelCorrect}/${currentLevelQuestions.length}`;

            // 计算星星
            let stars = 1;
            if (gameState.levelCorrect >= currentLevelQuestions.length * 0.8) stars = 2;
            if (gameState.levelCorrect === currentLevelQuestions.length) stars = 3;

            // 更新星星记录
            gameState.unitLevelStars[gameState.currentUnit][gameState.currentLevel] = Math.max(
                gameState.unitLevelStars[gameState.currentUnit][gameState.currentLevel],
                stars
            );

            // 解锁下一关
            if (gameState.currentLevel < activeLevels.length - 1) {
                gameState.unitLevelUnlocked[gameState.currentUnit][gameState.currentLevel + 1] = true;
            }

            // 检查成就
            const newAchievements = checkAchievements(stars);

            // 更新保存
            saveGameState();

            // 显示结算
            document.getElementById('completeTitle').textContent =
                stars === 3 ? '🏆 完美通关！' : '🎉 关卡完成！';
            document.getElementById('starsEarned').textContent = '⭐'.repeat(stars);
            document.getElementById('statScore').textContent = gameState.levelScore;
            document.getElementById('statCorrect').textContent = correctRate;
            document.getElementById('statTime').textContent = avgTime + 's';

            // 成就列表
            const list = document.getElementById('achievementsList');
            if (newAchievements.length > 0) {
                list.innerHTML = '<h3 style="color: #ffd700; margin-bottom: 10px;">🏆 新成就解锁！</h3>' +
                    newAchievements.map(a => `
                        <div class="achievement-item">
                            <span class="achievement-icon">${a.icon}</span>
                            <div class="achievement-info">
                                <h5>${a.name}</h5>
                                <p>${a.desc}</p>
                            </div>
                        </div>
                    `).join('');
            } else {
                list.innerHTML = '';
            }

            // 下一关按钮
            const nextBtn = document.getElementById('nextLevelBtn');
            const mapBtn = document.querySelector('.level-nav-btn.menu');
            if (mapBtn) {
                mapBtn.textContent = '🗺️ 地图';
                mapBtn.onclick = showLevelSelect;
            }
            if (gameState.currentLevel >= activeLevels.length - 1) {
                nextBtn.textContent = '🌟 单元完成！';
                nextBtn.onclick = () => {
                    selectUnit();
                };
            } else {
                nextBtn.textContent = '下一关 →';
                nextBtn.onclick = nextLevel;
            }

            switchScreen('levelCompleteScreen');
        }

        // 检查成就
        function checkAchievements(stars) {
            const activeLevels = getLevelsForUnit();

            const stats = buildAchievementStats({
                allLevelsClear: gameState.currentLevel >= activeLevels.length - 1 && stars > 0,
                oneLifeWin: gameState.lives === 1 && stars > 0,
                perfectStreak: gameState.levelCorrect === currentLevelQuestions.length
            });

            return unlockAchievements(stats);
        }

        function handleExtremeLevelComplete() {
            const avgTime = (gameState.levelTime / currentLevelQuestions.length).toFixed(1);
            const correctRate = `${gameState.levelCorrect}/${currentLevelQuestions.length}`;
            const hasNextSegment = gameState.extremeSegmentIndex < gameState.extremeSegments.length - 1;

            document.getElementById('completeTitle').textContent = hasNextSegment ? '⚔️ 本段通过！' : '👑 极限测试通过！';
            document.getElementById('starsEarned').textContent = hasNextSegment ? '🔥 无伤推进' : '🏆 零失误通关';
            document.getElementById('statScore').textContent = gameState.levelScore;
            document.getElementById('statCorrect').textContent = correctRate;
            document.getElementById('statTime').textContent = avgTime + 's';

            let newAchievements = [];
            if (!hasNextSegment) {
                gameState.extremePasses++;
                if (gameState.extremeScope === 'dual') {
                    gameState.extremeDualPasses++;
                }
                newAchievements = unlockAchievements(buildAchievementStats());
                saveGameState();
            }

            const list = document.getElementById('achievementsList');
            if (newAchievements.length > 0) {
                list.innerHTML = '<h3 style="color: #ffd700; margin-bottom: 10px;">🏆 新成就解锁！</h3>' +
                    newAchievements.map(a => `
                        <div class="achievement-item">
                            <span class="achievement-icon">${a.icon}</span>
                            <div class="achievement-info">
                                <h5>${a.name}</h5>
                                <p>${a.desc}</p>
                            </div>
                        </div>
                    `).join('');
            } else {
                list.innerHTML = hasNextSegment
                    ? '<div style="color: #fff; opacity: 0.9;">继续保持，全程不能出错。</div>'
                    : '<div style="color: #fff; opacity: 0.9;">本次极限测试已计入你的荣誉记录。</div>';
            }

            const nextBtn = document.getElementById('nextLevelBtn');
            if (hasNextSegment) {
                nextBtn.textContent = '进入下一段 →';
                nextBtn.onclick = nextLevel;
            } else {
                nextBtn.textContent = '返回主页';
                nextBtn.onclick = showStartScreen;
            }

            const mapBtn = document.querySelector('.level-nav-btn.menu');
            if (mapBtn) {
                mapBtn.textContent = hasNextSegment ? '结束考核' : '查看记录';
                mapBtn.onclick = hasNextSegment ? showStartScreen : showRecords;
            }

            switchScreen('levelCompleteScreen');
        }

        // 显示成就弹窗
        function showAchievementPopup(achievement) {
            const popup = document.getElementById('achievementPopup');
            document.getElementById('popupIcon').textContent = achievement.icon;
            document.getElementById('popupTitle').textContent = achievement.name;
            document.getElementById('popupDesc').textContent = achievement.desc;

            popup.style.display = 'block';
            setTimeout(() => {
                popup.style.display = 'none';
            }, 2500);
        }

        // 下一关
        function nextLevel() {
            if (gameState.isExtremeMode) {
                const nextSegment = gameState.extremeSegments[gameState.extremeSegmentIndex + 1];
                if (nextSegment) {
                    gameState.extremeSegmentIndex++;
                    gameState.currentUnit = nextSegment.unitIndex;
                    startLevel(nextSegment.levelIndex);
                } else {
                    showStartScreen();
                }
                return;
            }

            if (gameState.currentLevel < getLevelsForUnit().length - 1) {
                startLevel(gameState.currentLevel + 1);
            } else {
                selectUnit();
            }
        }

        // 显示关卡选择
        function showLevelSelect() {
            stopTimer();
            document.getElementById('statusBar').classList.add('hidden');
            if (gameState.isExtremeMode) {
                showExtremeModeSelect();
                return;
            }
            renderLevelMap();
            switchScreen('levelSelectScreen');
        }

        // 游戏结束
        function gameOver() {
            stopTimer();
            document.getElementById('gameOverScore').textContent = gameState.levelScore;
            if (gameState.isExtremeMode) {
                document.querySelector('.game-over-title').textContent = '💥 考核失败';
                document.getElementById('gameOverMessage').textContent = '极限测试中答错 1 题即终止，本次考核已结束。';
                document.getElementById('retryLevelBtn').textContent = '🔄 从起点重考';
                document.getElementById('gameOverLevel').textContent =
                    `${gameState.extremeSegmentIndex + 1}/${gameState.extremeSegments.length}`;
                document.getElementById('gameOverCorrect').textContent =
                    `${gameState.levelCorrect}/${currentLevelQuestions.length}`;
            } else {
                document.querySelector('.game-over-title').textContent = '💔 挑战失败';
                document.getElementById('gameOverMessage').textContent = '生命值耗尽，请重新挑战！';
                document.getElementById('retryLevelBtn').textContent = '🔄 重新挑战';
                document.getElementById('gameOverLevel').textContent =
                    `${gameState.currentLevel + 1}/${getLevelsForUnit().length}`;
                document.getElementById('gameOverCorrect').textContent =
                    `${gameState.totalCorrect}/${gameState.totalQuestions}`;
            }

            switchScreen('gameOverScreen');
        }

        // 重试关卡
        function retryLevel() {
            if (gameState.isExtremeMode) {
                startExtremeTest(gameState.extremeScope);
                return;
            }
            startLevel(gameState.currentLevel);
        }

        // 修炼场模式
        function startPractice() {
            resetExtremeMode();
            gameState.isPracticeMode = true;
            gameState.pendingMode = 'practice';
            selectUnit();
        }

        // 渲染修炼场题目
        function renderPracticeQuestion() {
            const q = currentLevelQuestions[gameState.practiceQuestionIndex];

            document.getElementById('practiceQuestionType').textContent = q.type;
            document.getElementById('practiceProgress').textContent =
                `${gameState.practiceQuestionIndex + 1} / ${currentLevelQuestions.length}`;
            document.getElementById('practiceQuestionContent').innerHTML = q.content;

            const optionsContainer = document.getElementById('practiceOptionsContainer');
            gameState.selectedAnswer = null;

            // 清除旧的答题反馈效果
            const practiceCard = document.querySelector('#practiceScreen .question-card');
            if (practiceCard) {
                practiceCard.classList.remove('answered-correct', 'answered-wrong');
                const feedback = practiceCard.querySelector('.answer-feedback');
                if (feedback) feedback.remove();
                const tip = practiceCard.querySelector('.correct-answer-tip');
                if (tip) tip.remove();
            }

            document.getElementById('practiceSubmitBtn').style.display = 'inline-block';
            document.getElementById('practiceSubmitBtn').textContent = '查看答案';
            document.getElementById('practiceNextBtn').style.display = 'none';

            if (q.type === '选择题') {
                optionsContainer.innerHTML = `
                    <div class="options-grid">
                        ${q.options.map(opt => `
                            <div class="option-card" onclick="practiceClickSubmit('choice', '${opt.letter}', this)">
                                <span class="option-letter">${opt.letter}</span>
                                <span>${opt.text}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else if (q.type === '判断题') {
                optionsContainer.innerHTML = `
                    <div class="judge-options">
                        <div class="judge-card true-btn" onclick="practiceClickSubmit('judge', 'true', this)">
                            <div class="icon">✓</div>
                            <div>正确</div>
                        </div>
                        <div class="judge-card false-btn" onclick="practiceClickSubmit('judge', 'false', this)">
                            <div class="icon">✗</div>
                            <div>错误</div>
                        </div>
                    </div>
                `;
            } else if (q.type === '填空题') {
                optionsContainer.innerHTML = `
                    <div class="fill-blank">
                        <input type="text" class="fill-input" id="practiceFillInput" 
                               placeholder="请输入答案" oninput="selectPracticeAnswer(this.value, this)">
                    </div>
                `;
            }

            document.getElementById('practiceNextBtn').style.display = 'none';
        }

        // 选择修炼场答案
        function selectPracticeAnswer(answer, element) {
            document.querySelectorAll('.option-card, .judge-card').forEach(el => {
                el.classList.remove('selected');
            });
            if (element) element.classList.add('selected');
            gameState.selectedAnswer = typeof answer === 'string' ? answer : answer.trim();
        }

        // 修炼场-选择题/判断题点击即提交
        function practiceClickSubmit(type, answer, element) {
            // 禁用所有选项/判断按钮防止重复点击
            if (type === 'choice') {
                document.querySelectorAll('#practiceOptionsContainer .option-card').forEach(el => {
                    el.style.pointerEvents = 'none';
                });
            } else if (type === 'judge') {
                document.querySelectorAll('#practiceOptionsContainer .judge-card').forEach(el => {
                    el.style.pointerEvents = 'none';
                });
            }
            gameState.selectedAnswer = answer;
            // 直接提交并显示答案
            submitPracticeAnswer();
        }

        // 提交修炼场答案
        function submitPracticeAnswer() {
            const q = currentLevelQuestions[gameState.practiceQuestionIndex];
            const userAnswer = gameState.selectedAnswer || '';
            const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(q.answer);

            gameState.practiceCount++;
            if (isCorrect) {
                gameState.totalCorrect++;
            }
            gameState.totalQuestions++;

            // 修炼场题目卡片反馈效果
            const practiceCard = document.querySelector('#practiceScreen .question-card');
            if (practiceCard) {
                practiceCard.classList.remove('answered-correct', 'answered-wrong');
                practiceCard.classList.add(isCorrect ? 'answered-correct' : 'answered-wrong');

                // 添加大字反馈
                const existingFeedback = practiceCard.querySelector('.answer-feedback');
                if (existingFeedback) existingFeedback.remove();

                const feedback = document.createElement('div');
                feedback.className = `answer-feedback ${isCorrect ? 'correct' : 'wrong'}`;
                feedback.textContent = isCorrect ? '✓ 正确！' : '✗ 错误！';
                practiceCard.appendChild(feedback);

                // 如果答错，添加正确答案提示
                if (!isCorrect) {
                    const existingTip = practiceCard.querySelector('.correct-answer-tip');
                    if (existingTip) existingTip.remove();

                    const tip = document.createElement('div');
                    tip.className = 'correct-answer-tip';
                    const correctAnswer = q.answer === 'true' ? '正确' : q.answer === 'false' ? '错误' : q.answer;
                    tip.innerHTML = `<strong>正确答案：${correctAnswer}</strong>`;
                    practiceCard.appendChild(tip);
                }
            }

            // 高亮答案
            highlightPracticeAnswer(q.answer, isCorrect);

            // 显示知识点
            const k = q.knowledge;
            const knowledgeBox = document.createElement('div');
            knowledgeBox.className = 'knowledge-box';
            knowledgeBox.style.marginTop = '20px';
            knowledgeBox.innerHTML = `
                <h4>📚 知识点解析</h4>
                <p><strong>运算符含义：</strong>${k.meaning}</p>
                <p><strong>运算规则：</strong>${k.rule}</p>
                <p><strong>常见易错点：</strong>${k.error}</p>
                <p><strong>相关示例：</strong>${k.example}</p>
            `;
            document.getElementById('practiceOptionsContainer').appendChild(knowledgeBox);

            // 隐藏填空题的提交按钮（如果存在）
            const submitBtn = document.getElementById('practiceSubmitBtn');
            if (submitBtn) submitBtn.style.display = 'none';

            // 显示下一题按钮
            document.getElementById('practiceNextBtn').style.display = 'inline-block';
            document.getElementById('practiceNextBtn').textContent = '下一题 →';

            saveGameState();
            checkPracticeAchievement();
        }

        // 高亮修炼场答案
        function highlightPracticeAnswer(correctAnswer, wasCorrect) {
            const options = document.querySelectorAll('#practiceOptionsContainer .option-card');
            const judges = document.querySelectorAll('#practiceOptionsContainer .judge-card');

            if (options.length > 0) {
                options.forEach(opt => {
                    const letter = opt.querySelector('.option-letter').textContent;
                    if (letter === correctAnswer) {
                        opt.classList.add('correct');
                    } else if (opt.classList.contains('selected') && !wasCorrect) {
                        opt.classList.add('wrong');
                    }
                });
            }

            if (judges.length > 0) {
                judges.forEach(btn => {
                    const isTrueBtn = btn.classList.contains('true-btn');
                    const shouldBeTrue = correctAnswer === 'true';
                    if (isTrueBtn === shouldBeTrue) {
                        btn.classList.add('correct');
                    } else if (btn.classList.contains('selected')) {
                        btn.classList.add('wrong');
                    }
                });
            }

            if (document.getElementById('practiceFillInput')) {
                const input = document.getElementById('practiceFillInput');
                input.disabled = true;
                if (!wasCorrect) {
                    input.style.borderColor = '#ff4757';
                } else {
                    input.style.borderColor = '#00ff88';
                }
            }
        }

        // 检查修炼场成就
        function checkPracticeAchievement() {
            const newAchievements = unlockAchievements(buildAchievementStats());
            if (newAchievements.length > 0) {
                saveGameState();
            }
        }

        // 下一题
        function nextPracticeQuestion() {
            gameState.practiceQuestionIndex++;
            const unitQuestions = unitQuestionsMap[gameState.currentUnit];
            if (gameState.practiceQuestionIndex >= unitQuestions.length) {
                gameState.practiceQuestionIndex = 0;
            }
            renderPracticeQuestion();
        }

        // 渲染成就列表
        function renderAchievements() {
            const container = document.getElementById('achievementsContainer');
            container.innerHTML = achievementList.map(a => {
                const unlocked = gameState.achievements.includes(a.id);
                return `
                    <div class="achievement-item" style="opacity: ${unlocked ? 1 : 0.5}; background: ${unlocked ? 'linear-gradient(135deg, #ffd70020, #ffaa0020)' : '#f5f5f5'};">
                        <span class="achievement-icon">${unlocked ? a.icon : '🔒'}</span>
                        <div class="achievement-info">
                            <h5 style="color: ${unlocked ? '#ffd700' : '#999'};">${a.name}</h5>
                            <p>${a.desc}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 显示成就界面
        function showAchievements() {
            gameState.pendingMode = 'adventure';
            gameState.isPracticeMode = false;
            resetExtremeMode();
            renderAchievements();
            switchScreen('achievementScreen');
        }

        function renderRecordTabs(activeIndex) {
            const tabsContainer = document.getElementById('recordProgressTabs');
            tabsContainer.innerHTML = units.map((_, idx) => {
                const totalStars = (gameState.unitLevelStars[idx] || []).reduce((sum, stars) => sum + stars, 0);
                return `<button class="segmented-tab ${idx === activeIndex ? 'active' : ''}" onclick="updateRecordLevelStats(${idx})">${getUnitDisplayName(idx)} (${totalStars}⭐)</button>`;
            }).join('');
        }

        function updateRecordLevelStats(unitIndex) {
            const safeUnitIndex = units[unitIndex] ? unitIndex : 0;
            const levels = getLevelsForUnit(safeUnitIndex);
            const starsByLevel = gameState.unitLevelStars[safeUnitIndex] || [];
            const container = document.getElementById('recordLevelStats');

            renderRecordTabs(safeUnitIndex);

            container.innerHTML = levels.map((level, idx) => {
                const stars = Math.max(0, Number(starsByLevel[idx]) || 0);
                const starsDisplay = stars > 0 ? '⭐'.repeat(stars) : '未完成';
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; margin-bottom: 10px; background: rgba(255,255,255,0.7); border-radius: 10px;">
                        <span style="font-weight: bold; color: #334;">第${idx + 1}关：${level.name}</span>
                        <span style="color: ${stars > 0 ? '#ff9800' : '#999'}; font-weight: bold;">${starsDisplay}</span>
                    </div>
                `;
            }).join('');
        }

        // 显示做题记录
        function showRecords() {
            gameState.pendingMode = 'adventure';
            gameState.isPracticeMode = false;
            resetExtremeMode();
            const stats = gameState;
            const totalQuestions = stats.totalQuestions;
            const correct = stats.totalCorrect;
            const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
            const totalStars = getTotalStars();

            // 更新统计数据
            document.getElementById('recordTotalQuestions').textContent = totalQuestions;
            document.getElementById('recordCorrect').textContent = correct;
            document.getElementById('recordAccuracy').textContent = accuracy + '%';
            document.getElementById('recordTotalStars').textContent = totalStars + '⭐';
            document.getElementById('recordExtremePasses').textContent = stats.extremePasses;
            document.getElementById('recordExtremeDualPasses').textContent = stats.extremeDualPasses;
            document.getElementById('recordPracticeCount').textContent = stats.practiceCount;

            updateRecordLevelStats(0);

            switchScreen('recordsScreen');
        }

        // 重置记录
        function resetRecords() {
            if (confirm('确定要重置所有做题记录吗？此操作无法撤销！')) {
                gameState.totalCorrect = 0;
                gameState.totalQuestions = 0;
                gameState.practiceCount = 0;
                gameState.extremePasses = 0;
                gameState.extremeDualPasses = 0;
                gameState.unitLevelStars = createDefaultUnitProgress(0);
                gameState.unitLevelUnlocked = createDefaultUnitProgress(false).map(unitProgress =>
                    unitProgress.map((_, levelIndex) => levelIndex === 0)
                );
                gameState.achievements = [];
                gameState.score = 0;
                saveGameState();
                showRecords();
            }
        }

        // 确认退出关卡
        function confirmQuitLevel() {
            const confirmMessage = gameState.isExtremeMode
                ? '确定要退出极限测试吗？退出后本次考核直接作废，再次挑战必须从起点重来。'
                : '确定要退出关卡吗？本关的进度将不会被保存。';

            if (confirm(confirmMessage)) {
                stopTimer();
                document.getElementById('statusBar').classList.add('hidden');
                if (gameState.isExtremeMode) {
                    showStartScreen();
                    return;
                }
                renderLevelMap();
                switchScreen('levelSelectScreen');
            }
        }

        function renderWrongAnalysisTabs() {
            const tabsContainer = document.getElementById('wrongAnalysisTabs');
            tabsContainer.innerHTML = units.map((unit, idx) => {
                const count = gameState.wrongQuestions.filter(item => item.unitIndex === idx).length;
                return `<button class="segmented-tab ${idx === gameState.wrongAnalysisUnit ? 'active' : ''}" onclick="showWrongAnalysis(${idx})">${getUnitDisplayName(idx)} (${count})</button>`;
            }).join('');
        }

        // 错误分析画面
        function showWrongAnalysis(unitIndex = 0) {
            gameState.wrongAnalysisUnit = units[unitIndex] ? unitIndex : 0;
            renderWrongAnalysisTabs();
            const container = document.getElementById('wrongAnalysisContainer');
            if (gameState.wrongQuestions.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">🌟 没有错误记录，继续加油！</div>';
            } else {
                const filteredWrongs = gameState.wrongQuestions.filter(item => item.unitIndex === gameState.wrongAnalysisUnit);

                if (filteredWrongs.length === 0) {
                    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">这个单元暂时没有错题记录。</div>';
                    switchScreen('wrongAnalysisScreen');
                    return;
                }

                container.innerHTML = filteredWrongs.map((w, idx) => {
                    const meta = getQuestionMetaById(w.id);
                    const q = meta ? meta.question : null;
                    const sourceLabel = meta
                        ? `[${meta.unitDisplayName} - ${meta.levelName}]`
                        : `[${getUnitDisplayName(Number(w.unitIndex || 0))} - ${w.levelName || w.category || '未知关卡'}]`;
                    let optionsHtml = '';
                    
                    if (w.type === '选择题' && q && q.options) {
                        optionsHtml = `
                            <div style="margin: 15px 0;">
                                <div style="font-weight: bold; color: #333; margin-bottom: 10px;">📋 选项：</div>
                                ${q.options.map(opt => {
                                    let optStyle = 'background: #fff; border: 2px solid #ddd;';
                                    let highlight = '';
                                    
                                    if (opt.letter === w.answer) {
                                        optStyle = 'background: linear-gradient(135deg, rgba(0,200,83,0.15), rgba(0,230,118,0.1)); border: 2px solid #00c853;';
                                        highlight = ' ✓ 正确';
                                    }
                                    if (opt.letter === w.userAnswer) {
                                        optStyle = 'background: linear-gradient(135deg, rgba(255,23,68,0.15), rgba(255,82,82,0.1)); border: 2px solid #ff1744;';
                                        highlight = ' ✗ 你选了这个';
                                    }
                                    
                                    return `
                                        <div style="${optStyle} padding: 12px 15px; margin-bottom: 8px; border-radius: 8px; cursor: default;">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <span style="font-weight: bold; color: #667eea;">${opt.letter}.</span>
                                                <span style="flex: 1; margin: 0 10px; color: #333;">${opt.text}</span>
                                                <span style="font-size: 0.85em; font-weight: bold; ${ opt.letter === w.answer ? 'color: #00c853;' : opt.letter === w.userAnswer ? 'color: #ff1744;' : 'color: #999;' }">${highlight}</span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `;
                    } else if (w.type === '判断题') {
                        const correctText = w.answer.toLowerCase() === 'true' ? '✓ 正确' : '✗ 错误';
                        const userText = w.userAnswer.toLowerCase() === 'true' ? '✓ 正确' : '✗ 错误';
                        optionsHtml = `
                            <div style="margin: 15px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <div style="background: linear-gradient(135deg, rgba(0,200,83,0.15), rgba(0,230,118,0.1)); border: 2px solid #00c853; padding: 15px; border-radius: 8px; text-align: center;">
                                    <div style="color: #999; font-size: 0.85em; margin-bottom: 5px;">正确答案</div>
                                    <div style="font-size: 1.3em; font-weight: bold; color: #00c853;">${correctText}</div>
                                </div>
                                <div style="background: linear-gradient(135deg, rgba(255,23,68,0.15), rgba(255,82,82,0.1)); border: 2px solid #ff1744; padding: 15px; border-radius: 8px; text-align: center;">
                                    <div style="color: #999; font-size: 0.85em; margin-bottom: 5px;">你的答案</div>
                                    <div style="font-size: 1.3em; font-weight: bold; color: #ff1744;">${userText}</div>
                                </div>
                            </div>
                        `;
                    } else if (w.type === '填空题') {
                        optionsHtml = `
                            <div style="margin: 15px 0;">
                                <div style="background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1)); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                                    <div style="color: #667eea; font-size: 0.9em; margin-bottom: 8px;"><strong>✓ 正确答案：</strong></div>
                                    <div style="background: #fff; padding: 10px; border-radius: 5px; color: #00c853; font-weight: bold; font-family: monospace;">${w.answer}</div>
                                </div>
                                <div style="background: linear-gradient(135deg, rgba(255,107,107,0.1), rgba(255,82,82,0.1)); padding: 15px; border-radius: 8px;">
                                    <div style="color: #ff6b6b; font-size: 0.9em; margin-bottom: 8px;"><strong>✗ 你的答案：</strong></div>
                                    <div style="background: #fff; padding: 10px; border-radius: 5px; color: #ff1744; font-weight: bold; font-family: monospace;">${w.userAnswer || '未答'}</div>
                                </div>
                            </div>
                        `;
                    }
                    
                    return `
                        <div style="background: rgba(255, 107, 107, 0.1); border-left: 4px solid #ff6b6b; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <span style="color: #ff6b6b; font-weight: bold; font-size: 1.1em;">${idx + 1}. ${sourceLabel} ${w.type}</span>
                                <span style="color: #999; font-size: 0.85em;">${w.timestamp}</span>
                            </div>
                            <div style="color: #333; margin-bottom: 15px; font-size: 1.05em; line-height: 1.6;">${w.content}</div>
                            ${optionsHtml}
                            <div style="background: linear-gradient(135deg, #667eea20, #764ba220); border-left: 4px solid #667eea; border-radius: 5px; padding: 15px; margin-top: 15px;">
                                <div style="color: #667eea; font-weight: bold; margin-bottom: 8px;">📚 知识解析：</div>
                                <div style="color: #555; font-size: 0.95em; line-height: 1.8;">
                                    <div style="margin-bottom: 8px;"><strong>• 含义：</strong>${w.knowledge.meaning}</div>
                                    <div style="margin-bottom: 8px;"><strong>• 规则：</strong>${w.knowledge.rule}</div>
                                    <div style="margin-bottom: 8px;"><strong>• 常见错误：</strong>${w.knowledge.error}</div>
                                    <div><strong>• 示例：</strong>${w.knowledge.example}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            switchScreen('wrongAnalysisScreen');
        }

        // 清除错误记录
        function clearWrongQuestions(scope = 'all') {
            const isActiveOnly = scope === 'active';
            const confirmMessage = isActiveOnly
                ? `确定要清空${units[gameState.wrongAnalysisUnit].name}的错题记录吗？`
                : '确定要清空所有错误记录吗？';

            if (confirm(confirmMessage)) {
                if (isActiveOnly) {
                    gameState.wrongQuestions = gameState.wrongQuestions.filter(item => item.unitIndex !== gameState.wrongAnalysisUnit);
                } else {
                    gameState.wrongQuestions = [];
                }
                saveGameState();
                showWrongAnalysis(gameState.wrongAnalysisUnit);
            }
        }

        function getUnitUnlockedCount(unitIndex) {
            return (gameState.unitLevelUnlocked[unitIndex] || []).filter(Boolean).length;
        }

        function getUnitStarCount(unitIndex) {
            return (gameState.unitLevelStars[unitIndex] || []).reduce((sum, stars) => sum + stars, 0);
        }

        function resetUnitProgress(unitIndex) {
            const levelCount = getLevelsForUnit(unitIndex).length;
            gameState.unitLevelUnlocked[unitIndex] = Array.from({ length: levelCount }, (_, levelIndex) => levelIndex === 0);
            gameState.unitLevelStars[unitIndex] = Array(levelCount).fill(0);
        }

        function unlockUnitProgress(unitIndex) {
            const levelCount = getLevelsForUnit(unitIndex).length;
            gameState.unitLevelUnlocked[unitIndex] = Array(levelCount).fill(true);
        }

        function setUnitStars(unitIndex, stars) {
            const levelCount = getLevelsForUnit(unitIndex).length;
            unlockUnitProgress(unitIndex);
            gameState.unitLevelStars[unitIndex] = Array(levelCount).fill(stars);
        }

        function updateDevPassHint(message, isError = false) {
            const hint = document.getElementById('devPassHint');
            if (!hint) return;
            hint.textContent = message;
            hint.style.color = isError ? '#ff9a9a' : '#a9b4ce';
        }

        function renderDevSummary() {
            const summary = document.getElementById('devQuickSummary');
            if (!summary) return;

            const cards = [
                { label: '总积分', value: gameState.score },
                { label: '总做题数', value: gameState.totalQuestions },
                { label: '错题记录', value: gameState.wrongQuestions.length },
                { label: '已解锁成就', value: `${gameState.achievements.length}/${achievementList.length}` },
                { label: '总星数', value: getTotalStars() },
                { label: '修炼题数', value: gameState.practiceCount },
                { label: '极限通关', value: gameState.extremePasses },
                { label: '综合大考', value: gameState.extremeDualPasses }
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

        function refreshDeveloperConsole(statusMessage) {
            if (!units[devSelectedUnit]) {
                devSelectedUnit = units[gameState.currentUnit] ? gameState.currentUnit : 0;
            }

            renderDevSummary();
            renderDevUnitTabs();
            renderDevUnitSummary();

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

            const msgUint8 = new TextEncoder().encode(input);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);

            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            if (inputHash === DEV_ACCESS_HASH) {
                closeDevMenu();
                devSelectedUnit = units[gameState.currentUnit] ? gameState.currentUnit : 0;
                switchScreen('adminScreen');
                refreshDeveloperConsole('验证成功，开发者控制台已就绪。');
            } else {
                inputElement.value = '';
                updateDevPassHint('口令错误，请重新输入。', true);
                inputElement.focus();
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

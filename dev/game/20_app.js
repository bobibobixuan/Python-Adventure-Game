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
            document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active', 'screen-enter'));

            const nextScreen = document.getElementById(screenId);
            nextScreen.classList.add('active');
            void nextScreen.offsetWidth;
            nextScreen.classList.add('screen-enter');
            window.scrollTo(0, 0);
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
            gameState.extremeRunCorrect = 0;
            gameState.extremeRunAttempted = 0;

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
            currentLevelQuestions = shuffleQuestions(unitQuestions);

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
            gameState.fastAnswer = false;
            gameState.isAnswerLocked = false;

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
            const questionContent = document.getElementById('questionContent');
            gameState.isAnswerLocked = false;

            document.getElementById('questionType').textContent = q.type;
            document.getElementById('questionProgress').textContent =
                `${gameState.currentQuestion + 1} / ${currentLevelQuestions.length}`;
            questionContent.innerHTML = q.content;
            formatMultilineCodeBlocks(questionContent);

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
                            <div class="option-card" role="button" tabindex="0" onclick="clickChoiceSubmit('${opt.letter}', this)" onkeypress="handleChoiceCardKeypress(event, '${opt.letter}', this)">
                                <span class="option-letter">${opt.letter}</span>
                                <span>${opt.text}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else if (q.type === '判断题') {
                optionsContainer.innerHTML = `
                    <div class="judge-options">
                        <div class="judge-card true-btn" role="button" tabindex="0" onclick="clickJudgeSubmit('true', this)" onkeypress="handleJudgeCardKeypress(event, 'true', this)">
                            <div class="icon">✓</div>
                            <div>正确</div>
                        </div>
                        <div class="judge-card false-btn" role="button" tabindex="0" onclick="clickJudgeSubmit('false', this)" onkeypress="handleJudgeCardKeypress(event, 'false', this)">
                            <div class="icon">✗</div>
                            <div>错误</div>
                        </div>
                    </div>
                `;
            } else if (q.type === '填空题') {
                optionsContainer.innerHTML = `
                    <div class="fill-blank">
                        <input type="text" class="fill-input" id="fillInput" 
                               placeholder="请输入答案" oninput="checkFillAnswer(this.value)" onkeydown="handleAdventureFillKeydown(event)">
                    </div>
                `;

                focusInputSoon('fillInput');
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
            if (element) {
                element.classList.add('selected');
            }
            gameState.selectedAnswer = answer;
            submitAnswer();
        }

        // 冒险模式-判断题点击即提交
        function clickJudgeSubmit(answer, element) {
            // 禁用所有判断按钮防止重复点击
            document.querySelectorAll('.judge-card').forEach(el => {
                el.style.pointerEvents = 'none';
            });
            if (element) {
                element.classList.add('selected');
            }
            gameState.selectedAnswer = answer;
            submitAnswer();
        }

        // 检查填空答案
        function checkFillAnswer(value) {
            if (hasNonEmptyAnswer(value)) {
                gameState.selectedAnswer = value.trim();
                document.getElementById('submitBtn').disabled = false;
            } else {
                gameState.selectedAnswer = null;
                document.getElementById('submitBtn').disabled = true;
            }
        }
        // 提交答案
        function submitAnswer() {
            if (gameState.isAnswerLocked) {
                return;
            }

            const q = currentLevelQuestions[gameState.currentQuestion];
            if (!q) {
                return;
            }

            gameState.isAnswerLocked = true;
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
                const existingIndex = gameState.wrongQuestions.findIndex(w => w.id === q.id);
                if (existingIndex !== -1) {
                    gameState.wrongQuestions[existingIndex] = wrongRecord;
                } else {
                    gameState.wrongQuestions.push(wrongRecord);
                }

                showWrongEffect();
            }

            // 更新顶部UI
            updateScoreDisplay();
            updateComboDisplay();
            if (isCorrect) {
                updateLivesDisplay();
            } else {
                window.setTimeout(() => {
                    updateLivesDisplay();
                }, 520);
            }
            gameState.totalQuestions++;

            if (gameState.isExtremeMode) {
                gameState.extremeRunAttempted++;
                if (isCorrect) {
                    gameState.extremeRunCorrect++;
                }
            }

            unlockAchievements(buildAchievementStats());

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

            // 3. 延迟 800 毫秒，让卡片飞一会儿，再弹出详细解析遮罩
            setTimeout(() => {
                showResult(isCorrect, points, bonus);
            }, 800);
        }

        // 标准化答案
        function normalizeAnswer(answer) {
            const str = String(answer).trim().toLowerCase();
            if (str === 'true' || str === '正确') return 'true';
            if (str === 'false' || str === '错误') return 'false';
            return str;
        }

        function clearQuestionFeedback(cardSelector = '.question-card') {
            const questionCard = document.querySelector(cardSelector);
            if (!questionCard) {
                return;
            }

            if (questionCard._feedbackTimerId) {
                clearTimeout(questionCard._feedbackTimerId);
                questionCard._feedbackTimerId = null;
            }

            questionCard.classList.remove('answered-correct', 'answered-wrong');

            const feedback = questionCard.querySelector('.answer-feedback');
            if (feedback) {
                feedback.remove();
            }

            const tip = questionCard.querySelector('.correct-answer-tip');
            if (tip) {
                tip.remove();
            }

            const practiceBanner = questionCard.querySelector('.practice-feedback-banner');
            if (practiceBanner) {
                practiceBanner.remove();
            }
        }

        function showPracticeTransientFeedback(questionCard, isCorrect) {
            if (!questionCard) {
                return;
            }

            if (questionCard._feedbackTimerId) {
                clearTimeout(questionCard._feedbackTimerId);
                questionCard._feedbackTimerId = null;
            }

            const existingFeedback = questionCard.querySelector('.answer-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }

            const feedback = document.createElement('div');
            feedback.className = `answer-feedback answer-feedback--practice ${isCorrect ? 'correct' : 'wrong'}`;
            feedback.textContent = isCorrect ? '✓ 正确！' : '✗ 错误！';

            const cardRect = questionCard.getBoundingClientRect();
            const questionContent = questionCard.querySelector('#practiceQuestionContent');
            const optionsContainer = questionCard.querySelector('#practiceOptionsContainer');
            const contentRect = questionContent ? questionContent.getBoundingClientRect() : null;
            const optionsRect = optionsContainer ? optionsContainer.getBoundingClientRect() : null;

            if (cardRect && contentRect && optionsRect) {
                const anchorTop = (contentRect.bottom + optionsRect.bottom) / 2 - cardRect.top;
                feedback.style.top = `${Math.max(110, anchorTop)}px`;
            }

            questionCard.appendChild(feedback);

            questionCard._feedbackTimerId = window.setTimeout(() => {
                feedback.remove();
                questionCard._feedbackTimerId = null;
            }, 2300);
        }

        // 显示结果
        function showResult(isCorrect, points, bonus) {
            const overlay = document.getElementById('resultOverlay');
            const icon = document.getElementById('resultIcon');
            const title = document.getElementById('resultTitle');
            const scoreDiv = document.getElementById('resultScore');
            const bonusDiv = document.getElementById('resultBonus');
            const knowledgeBox = document.getElementById('knowledgeBox');
            const continueBtn = overlay.querySelector('.continue-btn');

            icon.textContent = isCorrect ? '✓' : '✗';
            icon.style.fontSize = isCorrect ? '80px' : '80px';
            title.className = `result-title ${isCorrect ? 'correct' : 'wrong'}`;
            title.textContent = isCorrect ? '回答正确！🎉' : '回答错误';

            scoreDiv.textContent = isCorrect ? `+${points}` : '+0';
            scoreDiv.style.display = isCorrect ? 'block' : 'none';
            bonusDiv.textContent = bonus;
            bonusDiv.style.display = bonus ? 'block' : 'none';

            const q = currentLevelQuestions[gameState.currentQuestion];
            renderKnowledgeDetails(knowledgeBox, q);
            clearQuestionFeedback();

            overlay.classList.add('show');

            window.setTimeout(() => {
                if (continueBtn) {
                    continueBtn.focus();
                }
            }, 50);
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
                input.disabled = true;
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

            const lives = document.querySelectorAll('.life:not(.lost)');
            if (lives.length > 0) {
                const activeLife = lives[lives.length - 1];
                activeLife.classList.add('damage');
                setTimeout(() => {
                    activeLife.classList.remove('damage');
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
            const gameScreen = document.getElementById('gameScreen');
            const showPendingLevelScore = Boolean(gameScreen && gameScreen.classList.contains('active') && !gameState.isPracticeMode);
            const scoreToDisplay = gameState.score + (showPendingLevelScore ? gameState.levelScore : 0);

            document.getElementById('scoreDisplay').textContent = scoreToDisplay;
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

            gameState.score += gameState.levelScore;

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
            renderUnlockedAchievements(list, newAchievements);

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
            updateScoreDisplay();
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

            gameState.score += gameState.levelScore;

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
            }

            saveGameState();

            const list = document.getElementById('achievementsList');
            renderUnlockedAchievements(
                list,
                newAchievements,
                hasNextSegment ? '继续保持，全程不能出错。' : '本次极限测试已计入你的荣誉记录。'
            );

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
            updateScoreDisplay();
        }

        // 显示成就弹窗
        function showAchievementPopup(achievement) {
            achievementPopupQueue.push(achievement);
            if (achievementPopupActive) {
                return;
            }

            achievementPopupActive = true;
            displayNextAchievementPopup();
        }

        function displayNextAchievementPopup() {
            const popup = document.getElementById('achievementPopup');
            const popupMeta = document.getElementById('popupMeta');
            const achievement = achievementPopupQueue.shift();

            if (!popup || !achievement) {
                achievementPopupActive = false;
                return;
            }

            const rarityMeta = getAchievementRarityMeta(achievement.rarity);
            const categoryMeta = getAchievementCategoryMeta(achievement.category);

            popup.dataset.rarity = achievement.rarity || 'common';
            popup.style.setProperty('--achievement-popup-accent', rarityMeta.accent);
            document.getElementById('popupIcon').textContent = achievement.icon;
            document.getElementById('popupTitle').textContent = achievement.name;
            if (popupMeta) {
                popupMeta.textContent = `${categoryMeta.icon} ${achievement.category} · ${rarityMeta.label}`;
            }
            document.getElementById('popupDesc').textContent = achievement.desc;

            popup.style.display = 'block';
            popup.classList.remove('hide');
            void popup.offsetWidth;
            popup.classList.add('show');

            setTimeout(() => {
                popup.classList.remove('show');
                popup.classList.add('hide');

                setTimeout(() => {
                    popup.style.display = 'none';
                    popup.classList.remove('hide');
                    displayNextAchievementPopup();
                }, 240);
            }, 2800);
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
            const attemptedCount = getAttemptedQuestionCount();
            if (gameState.isExtremeMode) {
                document.querySelector('.game-over-title').textContent = '💥 考核失败';
                document.getElementById('gameOverMessage').textContent = '极限测试中答错 1 题即终止，本次考核已结束。';
                document.getElementById('retryLevelBtn').textContent = '🔄 从起点重考';
                document.getElementById('gameOverLevel').textContent =
                    `${gameState.extremeSegmentIndex + 1}/${gameState.extremeSegments.length}`;
                document.getElementById('gameOverCorrect').textContent =
                    `${gameState.extremeRunCorrect}/${gameState.extremeRunAttempted}`;
            } else {
                document.querySelector('.game-over-title').textContent = '💔 挑战失败';
                document.getElementById('gameOverMessage').textContent = '生命值耗尽，请重新挑战！';
                document.getElementById('retryLevelBtn').textContent = '🔄 重新挑战';
                document.getElementById('gameOverLevel').textContent =
                    `${gameState.currentLevel + 1}/${getLevelsForUnit().length}`;
                document.getElementById('gameOverCorrect').textContent =
                    `${gameState.levelCorrect}/${attemptedCount}`;
            }

            switchScreen('gameOverScreen');
            updateScoreDisplay();
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
            const practiceQuestionContent = document.getElementById('practiceQuestionContent');

            document.getElementById('practiceQuestionType').textContent = q.type;
            document.getElementById('practiceProgress').textContent =
                `${gameState.practiceQuestionIndex + 1} / ${currentLevelQuestions.length}`;
            practiceQuestionContent.innerHTML = q.content;
            formatMultilineCodeBlocks(practiceQuestionContent);

            const optionsContainer = document.getElementById('practiceOptionsContainer');
            gameState.selectedAnswer = null;

            // 清除旧的答题反馈效果
            clearQuestionFeedback('#practiceScreen .question-card');

            document.getElementById('practiceSubmitBtn').style.display = 'inline-block';
            document.getElementById('practiceSubmitBtn').textContent = '查看答案';
            document.getElementById('practiceSubmitBtn').disabled = q.type === '填空题';
            document.getElementById('practiceNextBtn').style.display = 'none';

            if (q.type === '选择题') {
                optionsContainer.innerHTML = `
                    <div class="options-grid">
                        ${q.options.map(opt => `
                            <div class="option-card" role="button" tabindex="0" onclick="practiceClickSubmit('choice', '${opt.letter}', this)" onkeypress="handlePracticeChoiceCardKeypress(event, '${opt.letter}', this)">
                                <span class="option-letter">${opt.letter}</span>
                                <span>${opt.text}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else if (q.type === '判断题') {
                optionsContainer.innerHTML = `
                    <div class="judge-options">
                        <div class="judge-card true-btn" role="button" tabindex="0" onclick="practiceClickSubmit('judge', 'true', this)" onkeypress="handlePracticeJudgeCardKeypress(event, 'true', this)">
                            <div class="icon">✓</div>
                            <div>正确</div>
                        </div>
                        <div class="judge-card false-btn" role="button" tabindex="0" onclick="practiceClickSubmit('judge', 'false', this)" onkeypress="handlePracticeJudgeCardKeypress(event, 'false', this)">
                            <div class="icon">✗</div>
                            <div>错误</div>
                        </div>
                    </div>
                `;
            } else if (q.type === '填空题') {
                optionsContainer.innerHTML = `
                    <div class="fill-blank">
                        <input type="text" class="fill-input" id="practiceFillInput" 
                               placeholder="请输入答案" oninput="selectPracticeAnswer(this.value, this)" onkeydown="handlePracticeFillKeydown(event)">
                    </div>
                `;

                focusInputSoon('practiceFillInput');
            }

            document.getElementById('practiceNextBtn').style.display = 'none';
            updatePracticeSubmitState();
        }

        // 选择修炼场答案
        function selectPracticeAnswer(answer, element) {
            document.querySelectorAll('.option-card, .judge-card').forEach(el => {
                el.classList.remove('selected');
            });
            if (element) element.classList.add('selected');
            const normalizedAnswer = String(answer ?? '').trim();
            gameState.selectedAnswer = normalizedAnswer || null;
            updatePracticeSubmitState();
        }

        function updatePracticeSubmitState() {
            const submitBtn = document.getElementById('practiceSubmitBtn');
            const currentQuestion = currentLevelQuestions[gameState.practiceQuestionIndex];

            if (!submitBtn || !currentQuestion) {
                return;
            }

            submitBtn.disabled = currentQuestion.type === '填空题' && !hasNonEmptyAnswer(gameState.selectedAnswer);
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
            if (element) {
                element.classList.add('selected');
            }
            gameState.selectedAnswer = answer;
            // 直接提交并显示答案
            submitPracticeAnswer();
        }

        // 提交修炼场答案
        function submitPracticeAnswer() {
            const q = currentLevelQuestions[gameState.practiceQuestionIndex];
            if (q.type === '填空题' && !hasNonEmptyAnswer(gameState.selectedAnswer)) {
                const input = document.getElementById('practiceFillInput');
                if (input) {
                    input.focus();
                }
                return;
            }

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
                showPracticeTransientFeedback(practiceCard, isCorrect);
            }

            // 高亮答案
            highlightPracticeAnswer(q.answer, isCorrect);

            // 显示知识点
            const knowledgeBox = document.createElement('div');
            knowledgeBox.className = 'knowledge-box';
            knowledgeBox.style.marginTop = '20px';
            renderKnowledgeDetails(knowledgeBox, q);
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
            if (gameState.practiceQuestionIndex >= currentLevelQuestions.length) {
                const unitQuestions = unitQuestionsMap[gameState.currentUnit];
                currentLevelQuestions = shuffleQuestions(unitQuestions);
                gameState.practiceQuestionIndex = 0;
            }
            renderPracticeQuestion();
        }

        // 渲染成就列表
        function renderAchievements() {
            const container = document.getElementById('achievementsContainer');
            const stats = buildAchievementStats();
            const unlockedCount = gameState.achievements.length;
            const legendaryCount = achievementList.filter(achievement => achievement.rarity === 'legendary' && isAchievementUnlocked(achievement.id)).length;
            const rarePlusCount = achievementList.filter(achievement => ['rare', 'epic', 'legendary'].includes(achievement.rarity) && isAchievementUnlocked(achievement.id)).length;

            container.innerHTML = `
                <section class="achievement-overview">
                    <div class="achievement-summary-card">
                        <div class="achievement-summary-label">已解锁</div>
                        <div class="achievement-summary-value">${unlockedCount}/${achievementList.length}</div>
                    </div>
                    <div class="achievement-summary-card">
                        <div class="achievement-summary-label">稀有以上</div>
                        <div class="achievement-summary-value">${rarePlusCount}</div>
                    </div>
                    <div class="achievement-summary-card">
                        <div class="achievement-summary-label">传说勋章</div>
                        <div class="achievement-summary-value">${legendaryCount}</div>
                    </div>
                    <div class="achievement-summary-card">
                        <div class="achievement-summary-label">当前进度</div>
                        <div class="achievement-summary-value">⭐ ${stats.totalStars} · 🔥 ${stats.maxCombo}</div>
                    </div>
                </section>
                <section class="achievement-grid">
                    ${achievementList.map(achievement => getAchievementCardMarkup(achievement, stats)).join('')}
                </section>
            `;
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
            if (confirm('确定要重置全部做题记录吗？这会清空积分、进度、成就和错题记录，且无法撤销。')) {
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
                gameState.wrongQuestions = [];
                gameState.score = 0;
                storageStatusMessage = '已通过记录页清空全部学习记录。';
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
        function showWrongAnalysis(unitIndex) {
            const resolvedUnitIndex = typeof unitIndex === 'number'
                ? unitIndex
                : getDefaultWrongAnalysisUnit();

            gameState.wrongAnalysisUnit = units[resolvedUnitIndex] ? resolvedUnitIndex : 0;
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
                    const viewModel = buildWrongQuestionViewModel(w);
                    const q = viewModel.question;
                    const sourceLabel = viewModel.sourceLabel;
                    const userAnswer = escapeHtml(w.userAnswer || '未答');
                    let optionsHtml = '';
                    
                    if (q && q.type === '选择题' && q.options) {
                        optionsHtml = `
                            <div style="margin: 15px 0;">
                                <div style="font-weight: bold; color: #333; margin-bottom: 10px;">📋 选项：</div>
                                ${q.options.map(opt => {
                                    let optStyle = 'background: #fff; border: 2px solid #ddd;';
                                    let highlight = '';
                                    
                                    if (opt.letter === q.answer) {
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
                                                <span style="font-size: 0.85em; font-weight: bold; ${ opt.letter === q.answer ? 'color: #00c853;' : opt.letter === w.userAnswer ? 'color: #ff1744;' : 'color: #999;' }">${highlight}</span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `;
                    } else if (q && q.type === '判断题') {
                        const correctText = normalizeAnswer(q.answer) === 'true' ? '✓ 正确' : '✗ 错误';
                        const userText = normalizeAnswer(w.userAnswer) === 'true'
                            ? '✓ 正确'
                            : normalizeAnswer(w.userAnswer) === 'false'
                                ? '✗ 错误'
                                : userAnswer;
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
                    } else if (q && q.type === '填空题') {
                        optionsHtml = `
                            <div style="margin: 15px 0;">
                                <div style="background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1)); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                                    <div style="color: #667eea; font-size: 0.9em; margin-bottom: 8px;"><strong>✓ 正确答案：</strong></div>
                                    <div style="background: #fff; padding: 10px; border-radius: 5px; color: #00c853; font-weight: bold; font-family: monospace; white-space: pre-wrap; word-break: break-word;">${escapeHtml(q.answer)}</div>
                                </div>
                                <div style="background: linear-gradient(135deg, rgba(255,107,107,0.1), rgba(255,82,82,0.1)); padding: 15px; border-radius: 8px;">
                                    <div style="color: #ff6b6b; font-size: 0.9em; margin-bottom: 8px;"><strong>✗ 你的答案：</strong></div>
                                    <div style="background: #fff; padding: 10px; border-radius: 5px; color: #ff1744; font-weight: bold; font-family: monospace; white-space: pre-wrap; word-break: break-word;">${userAnswer}</div>
                                </div>
                            </div>
                        `;
                    } else {
                        optionsHtml = `
                            <div style="margin: 15px 0; background: rgba(255,255,255,0.7); border-radius: 8px; padding: 15px; color: #666; line-height: 1.8;">
                                该题已从当前题库中移除，保留你的作答记录：<strong>${userAnswer}</strong>
                            </div>
                        `;
                    }
                    
                    return `
                        <div style="background: rgba(255, 107, 107, 0.1); border-left: 4px solid #ff6b6b; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <span style="color: #ff6b6b; font-weight: bold; font-size: 1.1em;">${idx + 1}. ${sourceLabel} ${q ? q.type : '已失效记录'}</span>
                                <span style="color: #999; font-size: 0.85em;">${escapeHtml(w.timestamp)}</span>
                            </div>
                            <div style="color: #333; margin-bottom: 15px; font-size: 1.05em; line-height: 1.6;">${q ? q.content : '<em>该题题干已不可用。</em>'}</div>
                            ${optionsHtml}
                            ${q ? `<div class="knowledge-box knowledge-box--embedded">${buildKnowledgeDetailsMarkup(q)}</div>` : ''}
                        </div>
                    `;
                }).join('');
                formatMultilineCodeBlocks(container);
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

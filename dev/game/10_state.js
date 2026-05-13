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

        function getCompletedLevelCount() {
            return gameState.unitLevelStars.reduce(
                (sum, unitStars) => sum + unitStars.filter(stars => stars > 0).length,
                0
            );
        }

        function getTotalLevelCount() {
            return units.reduce((sum, _, unitIndex) => sum + getLevelsForUnit(unitIndex).length, 0);
        }

        function getUnlockedLevelCount() {
            return gameState.unitLevelUnlocked.reduce(
                (sum, unitUnlocked) => sum + unitUnlocked.filter(Boolean).length,
                0
            );
        }

        function getBestUnitStarCount() {
            return Math.max(
                0,
                ...gameState.unitLevelStars.map(unitStars => unitStars.reduce((sum, stars) => sum + stars, 0))
            );
        }

        function isCurrentUnitCleared() {
            const activeLevels = getLevelsForUnit(gameState.currentUnit);
            const unitStars = gameState.unitLevelStars[gameState.currentUnit] || [];

            return activeLevels.length > 0 && activeLevels.every((_, levelIndex) => (unitStars[levelIndex] || 0) > 0);
        }

        function getCompletedUnitCount() {
            return units.filter((_, unitIndex) => {
                const unitStars = gameState.unitLevelStars[unitIndex] || [];
                return unitStars.length > 0 && unitStars.every(stars => stars > 0);
            }).length;
        }

        function buildAchievementStats(overrides = {}) {
            const totalQuestions = gameState.totalQuestions;
            const totalCorrect = gameState.totalCorrect;

            return Object.assign({
                fastAnswer: gameState.fastAnswer,
                maxCombo: gameState.maxCombo,
                perfectLevel: gameState.perfectLevel,
                allLevelsClear: false,
                oneLifeWin: gameState.lives === 1,
                practiceCount: gameState.practiceCount,
                fastStreak: gameState.fastStreak,
                perfectStreak: gameState.levelCorrect === currentLevelQuestions.length && currentLevelQuestions.length > 0,
                totalCorrect,
                totalQuestions,
                totalStars: getTotalStars(),
                completedLevels: getCompletedLevelCount(),
                unlockedLevels: getUnlockedLevelCount(),
                totalLevels: getTotalLevelCount(),
                completedUnits: getCompletedUnitCount(),
                totalUnits: units.length,
                currentUnitCleared: isCurrentUnitCleared(),
                bestUnitStars: getBestUnitStarCount(),
                wrongQuestionCount: gameState.wrongQuestions.length,
                accuracy: totalQuestions > 0 ? totalCorrect / totalQuestions : 0,
                allUnitsCleared: getCompletedUnitCount() >= units.length,
                unlockedAchievements: gameState.achievements.length,
                totalAchievements: achievementList.length,
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

        function normalizeWrongQuestionRecord(record) {
            if (!record || !Number.isFinite(Number(record.id))) {
                return null;
            }

            const questionId = Number(record.id);
            const meta = getQuestionMetaById(questionId);
            const parsedUnitIndex = Number(record.unitIndex);
            const parsedLevelIndex = Number(record.levelIndex);
            const unitIndex = Number.isInteger(parsedUnitIndex) && units[parsedUnitIndex]
                ? parsedUnitIndex
                : meta ? meta.unitIndex : 0;
            const levelIndex = Number.isInteger(parsedLevelIndex) && parsedLevelIndex >= 0
                ? parsedLevelIndex
                : meta ? meta.levelIndex : 0;

            return {
                id: questionId,
                userAnswer: record.userAnswer === undefined || record.userAnswer === null
                    ? ''
                    : String(record.userAnswer),
                timestamp: typeof record.timestamp === 'string' && record.timestamp.trim()
                    ? record.timestamp
                    : new Date().toLocaleString(),
                unitIndex,
                levelIndex
            };
        }

        function buildWrongQuestionViewModel(record) {
            const meta = getQuestionMetaById(record.id);
            const unitIndex = meta ? meta.unitIndex : record.unitIndex;
            const levelIndex = meta ? meta.levelIndex : record.levelIndex;
            const fallbackLevel = getLevelsForUnit(unitIndex)[levelIndex];

            return {
                question: meta ? meta.question : null,
                unitIndex,
                levelIndex,
                sourceLabel: meta
                    ? `[${meta.unitDisplayName} - ${meta.levelName}]`
                    : `[${getUnitDisplayName(unitIndex)} - ${fallbackLevel ? fallbackLevel.name : '未知关卡'}]`
            };
        }

        function escapeHtml(value) {
            return String(value ?? '').replace(/[&<>"']/g, char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char]));
        }

        function getQuestionAnswerMarkup(question) {
            if (!question) {
                return '未知';
            }

            if (question.type === '选择题') {
                const option = Array.isArray(question.options)
                    ? question.options.find(candidate => candidate.letter === question.answer)
                    : null;

                return option
                    ? `<strong>${escapeHtml(question.answer)}.</strong> ${option.text}`
                    : escapeHtml(question.answer);
            }

            if (question.type === '判断题') {
                return normalizeAnswer(question.answer) === 'true' ? '正确' : '错误';
            }

            return `<code>${escapeHtml(question.answer)}</code>`;
        }

        function getBeginnerThinkingSteps(question) {
            const questionText = String(question?.content || '');

            if (question?.type === '填空题' && (questionText.includes('执行代码') || questionText.includes('print('))) {
                return [
                    '先看变量一开始的值，不要急着看最后一行。',
                    '再判断 if 条件是真是假，只执行真正会走到的分支。',
                    '最后按顺序模拟每一行代码，算出最终输出。'
                ];
            }

            if (question?.type === '选择题') {
                return [
                    '先看题目在问写法、规则还是运行结果。',
                    '把明显不合法或明显违背规则的选项先排掉。',
                    '最后只在剩下的选项里比较，选最符合 Python 规则的一项。'
                ];
            }

            if (question?.type === '判断题') {
                return [
                    '先把题目改写成一句“Python 里能不能这样做”。',
                    '再直接拿语法规则去判断真或假，不要靠感觉。',
                    '看到“必须、一定、只能”这种绝对说法时，要格外小心。'
                ];
            }

            return [
                '先看题目到底在考哪个规则。',
                '再判断当前写法或条件是否符合这个规则。',
                '最后回头检查有没有漏掉缩进、符号或边界情况。'
            ];
        }

        function buildKnowledgeDetailsMarkup(question, knowledge = question?.knowledge) {
            if (!knowledge) {
                return '';
            }

            const steps = getBeginnerThinkingSteps(question);

            return `
                <div class="knowledge-heading">
                    <div>
                        <h4>📚 小白版答案解析</h4>
                        <div class="knowledge-meta">
                            <span class="knowledge-chip">${escapeHtml(question?.category || '基础知识')}</span>
                            <span class="knowledge-chip">${escapeHtml(question?.type || '题目解析')}</span>
                        </div>
                    </div>
                    <div class="knowledge-answer-card">
                        <div class="knowledge-answer-label">这题答案</div>
                        <div class="knowledge-answer-value">${getQuestionAnswerMarkup(question)}</div>
                    </div>
                </div>
                <div class="knowledge-grid">
                    <section class="knowledge-section knowledge-section--highlight">
                        <h5>这题其实在考什么</h5>
                        <p>${knowledge.meaning}</p>
                    </section>
                    <section class="knowledge-section">
                        <h5>为什么答案是这个</h5>
                        <p>${knowledge.rule}</p>
                    </section>
                    <section class="knowledge-section">
                        <h5>新手可以怎么想</h5>
                        <ol class="knowledge-steps">
                            ${steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </section>
                    <section class="knowledge-section">
                        <h5>最容易踩的坑</h5>
                        <p>${knowledge.error}</p>
                    </section>
                </div>
                <div class="knowledge-example-panel">
                    <h5>照着这个小例子记</h5>
                    <div class="knowledge-example-content">${knowledge.example}</div>
                </div>
            `;
        }

        function renderKnowledgeDetails(container, question) {
            if (!container || !question?.knowledge) {
                return;
            }

            container.innerHTML = buildKnowledgeDetailsMarkup(question);
            formatMultilineCodeBlocks(container);
        }

        function getAchievementRarityMeta(rarity = 'common') {
            return achievementRarityMeta[rarity] || achievementRarityMeta.common;
        }

        function getAchievementCategoryMeta(category = '启程') {
            return achievementCategoryMeta[category] || { icon: '🏆', accent: '#667eea' };
        }

        function normalizeAchievementProgress(progress, fallbackLabel = '待解锁') {
            const current = Math.max(0, Number(progress?.current ?? 0) || 0);
            const target = Math.max(1, Number(progress?.target ?? 1) || 1);
            const ratioSource = progress?.ratio !== undefined ? Number(progress.ratio) : current / target;
            const ratio = Math.max(0, Math.min(1, Number.isFinite(ratioSource) ? ratioSource : current / target));
            const complete = progress?.complete !== undefined ? Boolean(progress.complete) : current >= target;

            return {
                current,
                target,
                ratio,
                complete,
                label: progress?.label || (complete ? '已达成' : fallbackLabel)
            };
        }

        function getAchievementProgress(achievement, stats = buildAchievementStats()) {
            if (typeof achievement.getProgress === 'function') {
                return normalizeAchievementProgress(achievement.getProgress(stats), achievement.hint || '待解锁');
            }

            const complete = typeof achievement.condition === 'function' ? achievement.condition(stats) : false;
            return normalizeAchievementProgress({ complete }, achievement.hint || '待解锁');
        }

        function isAchievementUnlocked(achievementId) {
            return gameState.achievements.includes(achievementId);
        }

        function getAchievementCardMarkup(achievement, stats, compact = false) {
            const unlocked = isAchievementUnlocked(achievement.id);
            const progress = getAchievementProgress(achievement, stats);
            const rarityMeta = getAchievementRarityMeta(achievement.rarity);
            const categoryMeta = getAchievementCategoryMeta(achievement.category);
            const progressWidth = Math.round(progress.ratio * 100);

            if (compact) {
                return `
                    <div class="achievement-item achievement-item--compact rarity-${achievement.rarity || 'common'}" style="--achievement-accent: ${rarityMeta.accent}; --achievement-category-accent: ${categoryMeta.accent};">
                        <span class="achievement-icon">${achievement.icon}</span>
                        <div class="achievement-info">
                            <div class="achievement-inline-meta">
                                <span class="achievement-inline-pill">${categoryMeta.icon} ${achievement.category}</span>
                                <span class="achievement-inline-pill achievement-inline-pill--rarity">${rarityMeta.label}</span>
                            </div>
                            <h5>${achievement.name}</h5>
                            <p>${achievement.desc}</p>
                        </div>
                    </div>
                `;
            }

            return `
                <article class="achievement-card ${unlocked ? 'is-unlocked' : 'is-locked'} rarity-${achievement.rarity || 'common'}" style="--achievement-accent: ${rarityMeta.accent}; --achievement-category-accent: ${categoryMeta.accent}; --achievement-progress: ${progressWidth}%;">
                    <div class="achievement-card-head">
                        <div class="achievement-card-icon">${unlocked ? achievement.icon : '🔒'}</div>
                        <div class="achievement-card-badges">
                            <span class="achievement-badge">${categoryMeta.icon} ${achievement.category}</span>
                            <span class="achievement-badge achievement-badge--rarity">${rarityMeta.label}</span>
                        </div>
                    </div>
                    <h3 class="achievement-card-title">${achievement.name}</h3>
                    <p class="achievement-card-desc">${achievement.desc}</p>
                    <div class="achievement-progress-block">
                        <div class="achievement-progress-track"><span style="width: ${progressWidth}%;"></span></div>
                        <div class="achievement-progress-meta">
                            <span>${unlocked ? '已解锁' : progress.label}</span>
                            <span>${Math.round(progress.ratio * 100)}%</span>
                        </div>
                    </div>
                    <p class="achievement-card-hint">${unlocked ? '已收入勋章墙。' : (achievement.hint || '继续挑战即可解锁。')}</p>
                </article>
            `;
        }

        function renderUnlockedAchievements(container, newAchievements, emptyMessage = '') {
            if (!container) {
                return;
            }

            if (newAchievements.length > 0) {
                const stats = buildAchievementStats();
                container.innerHTML = '<h3 style="color: #ffd700; margin-bottom: 10px;">🏆 新成就解锁！</h3>' +
                    `<div class="achievement-inline-list">${newAchievements.map(achievement => getAchievementCardMarkup(achievement, stats, true)).join('')}</div>`;
                return;
            }

            container.innerHTML = emptyMessage
                ? `<div style="color: #fff; opacity: 0.9;">${emptyMessage}</div>`
                : '';
        }

        function getAttemptedQuestionCount() {
            return currentLevelQuestions.length === 0
                ? 0
                : Math.min(gameState.currentQuestion + 1, currentLevelQuestions.length);
        }

        function createWrongQuestionRecord(question, userAnswer) {
            return {
                id: question.id,
                userAnswer: userAnswer === undefined || userAnswer === null ? '' : String(userAnswer),
                timestamp: new Date().toLocaleString(),
                unitIndex: gameState.currentUnit,
                levelIndex: gameState.currentLevel
            };
        }

        function buildPersistedGameState() {
            return {
                storageVersion: STORAGE_VERSION,
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
            };
        }

        function applySavedGameState(data) {
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                throw new Error('存档根节点必须是对象。');
            }

            const nextState = createDefaultGameState();
            let migrated = false;
            const warnings = [];
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

            nextState.unitLevelUnlocked = normalizeUnitProgress(data.unitLevelUnlocked, false).map(unitProgress =>
                unitProgress.map((isUnlocked, levelIndex) => levelIndex === 0 ? true : Boolean(isUnlocked))
            );
            nextState.unitLevelStars = normalizeUnitProgress(data.unitLevelStars, 0).map(unitProgress =>
                unitProgress.map(stars => Math.max(0, Number(stars) || 0))
            );

            if ((data.unitOrderVersion || 1) < 2) {
                nextState.unitLevelUnlocked = swapUnitOrder(nextState.unitLevelUnlocked);
                nextState.unitLevelStars = swapUnitOrder(nextState.unitLevelStars);
                migrated = true;
            }

            nextState.achievements = Array.isArray(data.achievements)
                ? data.achievements.filter(id => achievementList.some(achievement => achievement.id === id))
                : [];

            const wrongQuestions = Array.isArray(data.wrongQuestions) ? data.wrongQuestions : [];
            nextState.wrongQuestions = wrongQuestions
                .map(normalizeWrongQuestionRecord)
                .filter(Boolean);
            if (nextState.wrongQuestions.length !== wrongQuestions.length) {
                warnings.push('部分错题记录无法识别，已自动忽略。');
                migrated = true;
            }

            nextState.totalCorrect = Math.max(0, Number(data.totalCorrect || 0));
            nextState.totalQuestions = Math.max(0, Number(data.totalQuestions || 0));
            nextState.score = Math.max(0, Number(data.score || 0));
            nextState.practiceCount = Math.max(0, Number(data.practiceCount || 0));
            nextState.extremePasses = Math.max(0, Number(data.extremePasses || 0));
            nextState.extremeDualPasses = Math.max(0, Number(data.extremeDualPasses || 0));

            if ((data.storageVersion || 0) < STORAGE_VERSION || data.levelUnlocked !== undefined || data.levelStars !== undefined) {
                migrated = true;
            }

            gameState = nextState;
            return { migrated, warnings };
        }

        function resetExtremeMode() {
            gameState.isExtremeMode = false;
            gameState.extremeScope = null;
            gameState.extremeSegments = [];
            gameState.extremeSegmentIndex = 0;
            gameState.extremeRunCorrect = 0;
            gameState.extremeRunAttempted = 0;
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
                const progress = getAchievementProgress(achievement, stats);
                if (!gameState.achievements.includes(achievement.id) && progress.complete) {
                    gameState.achievements.push(achievement.id);
                    newAchievements.push(achievement);
                    showAchievementPopup(achievement);
                }
            });

            return newAchievements;
        }

        // 加载游戏状态
        function loadGameState() {
            let saved = null;

            try {
                saved = localStorage.getItem(STORAGE_KEY);
            } catch (error) {
                console.warn('读取存档失败，已回退到默认进度。', error);
                gameState = createDefaultGameState();
                storageStatusMessage = '浏览器存储不可用，已回退到默认进度。';
                return;
            }

            if (!saved) {
                gameState = createDefaultGameState();
                storageStatusMessage = '未发现本地存档，已使用默认进度。';
                return;
            }

            try {
                const data = JSON.parse(saved);
                const { migrated, warnings } = applySavedGameState(data);
                storageStatusMessage = warnings.length > 0
                    ? warnings.join('；')
                    : migrated
                        ? '旧存档已自动迁移到最新版本。'
                        : '本地存档已读取。';

                if (migrated) {
                    saveGameState();
                }
            } catch (error) {
                console.warn('存档损坏，已自动重置。', error);
                gameState = createDefaultGameState();
                storageStatusMessage = '检测到损坏存档，已自动重置为默认进度。';

                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch (removeError) {
                    console.warn('清理损坏存档失败。', removeError);
                }
            }
        }

        // 保存游戏状态
        function saveGameState() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(buildPersistedGameState()));
                return true;
            } catch (error) {
                console.warn('保存存档失败。', error);
                storageStatusMessage = '保存失败：浏览器存储不可用。';
                return false;
            }
        }

        // 显示开始界面

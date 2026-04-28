const achievementRarityMeta = {
            common: { label: '常规', accent: '#7be0a4' },
            rare: { label: '稀有', accent: '#67d2ff' },
            epic: { label: '史诗', accent: '#c58cff' },
            legendary: { label: '传说', accent: '#ffd166' }
        };

        const achievementCategoryMeta = {
            启程: { icon: '🚀', accent: '#667eea' },
            节奏: { icon: '⚡', accent: '#00d9ff' },
            实战: { icon: '🛡️', accent: '#00c853' },
            修炼: { icon: '📚', accent: '#ff9f1c' },
            探索: { icon: '🧭', accent: '#8e7dff' },
            极限: { icon: '👑', accent: '#ff6b6b' }
        };

        function buildThresholdProgress(currentValue, targetValue, suffix = '') {
            const current = Math.max(0, Number(currentValue) || 0);
            const target = Math.max(1, Number(targetValue) || 1);
            const displayCurrent = Math.min(current, target);

            return {
                current,
                target,
                ratio: Math.min(current / target, 1),
                complete: current >= target,
                label: `${displayCurrent}/${target}${suffix}`
            };
        }

        function buildFlagProgress(complete, lockedText = '待完成') {
            return {
                current: complete ? 1 : 0,
                target: 1,
                ratio: complete ? 1 : 0,
                complete,
                label: complete ? '已达成' : lockedText
            };
        }

        function createThresholdAchievement({ id, name, icon, desc, category, rarity, statKey, target, suffix = '', hint }) {
            return {
                id,
                name,
                icon,
                desc,
                category,
                rarity,
                hint,
                getProgress: (stats) => buildThresholdProgress(stats[statKey], target, suffix),
                condition: (stats) => Number(stats[statKey] || 0) >= target
            };
        }

        function createFlagAchievement({ id, name, icon, desc, category, rarity, statKey, hint }) {
            return {
                id,
                name,
                icon,
                desc,
                category,
                rarity,
                hint,
                getProgress: (stats) => buildFlagProgress(Boolean(stats[statKey]), hint || '待达成'),
                condition: (stats) => Boolean(stats[statKey])
            };
        }

        function createCustomAchievement(config) {
            return config;
        }

// 成就配置
        const achievementList = [
            createThresholdAchievement({
                id: 'first_win',
                name: '初试锋芒',
                icon: '🌱',
                desc: '首次答对题目，正式踏入闯关之路。',
                category: '启程',
                rarity: 'common',
                statKey: 'totalCorrect',
                target: 1,
                hint: '先答对 1 题。'
            }),
            createThresholdAchievement({
                id: 'rookie_pacer',
                name: '起步热身',
                icon: '🥾',
                desc: '累计完成 10 道题，熟悉游戏节奏。',
                category: '启程',
                rarity: 'common',
                statKey: 'totalQuestions',
                target: 10,
                suffix: '题',
                hint: '累计作答 10 题。'
            }),
            createThresholdAchievement({
                id: 'question_hunter',
                name: '百题斩',
                icon: '🗡️',
                desc: '累计完成 100 道题，正式迈入高强度训练。',
                category: '启程',
                rarity: 'epic',
                statKey: 'totalQuestions',
                target: 100,
                suffix: '题',
                hint: '累计作答 100 题。'
            }),
            createThresholdAchievement({
                id: 'score_apprentice',
                name: '积分学徒',
                icon: '🪙',
                desc: '总积分达到 1000，开始稳定积累。',
                category: '启程',
                rarity: 'rare',
                statKey: 'score',
                target: 1000,
                suffix: '分',
                hint: '累计总积分达到 1000。'
            }),
            createThresholdAchievement({
                id: 'score_architect',
                name: '积分建筑师',
                icon: '🏛️',
                desc: '总积分达到 5000，说明你已经刷出稳定实力。',
                category: '启程',
                rarity: 'legendary',
                statKey: 'score',
                target: 5000,
                suffix: '分',
                hint: '累计总积分达到 5000。'
            }),
            createFlagAchievement({
                id: 'speed_demon',
                name: '速算达人',
                icon: '⚡',
                desc: '在 5 秒内答对 1 题，手速与思路同时在线。',
                category: '节奏',
                rarity: 'rare',
                statKey: 'fastAnswer',
                hint: '在 5 秒内答对 1 题。'
            }),
            createThresholdAchievement({
                id: 'combo_master',
                name: '连击大师',
                icon: '🔥',
                desc: '连续答对 5 题，把节奏稳稳接住。',
                category: '节奏',
                rarity: 'rare',
                statKey: 'maxCombo',
                target: 5,
                hint: '把最高连击推到 5。'
            }),
            createThresholdAchievement({
                id: 'combo_emperor',
                name: '连击帝王',
                icon: '🌋',
                desc: '连续答对 10 题，进入无缝输出状态。',
                category: '节奏',
                rarity: 'epic',
                statKey: 'maxCombo',
                target: 10,
                hint: '把最高连击推到 10。'
            }),
            createThresholdAchievement({
                id: 'speed_5',
                name: '快如闪电',
                icon: '💨',
                desc: '连续 5 题都在 5 秒内答对，节奏直接拉满。',
                category: '节奏',
                rarity: 'epic',
                statKey: 'fastStreak',
                target: 5,
                hint: '连续 5 题 5 秒内答对。'
            }),
            createFlagAchievement({
                id: 'perfect_clear',
                name: '零伤通关',
                icon: '💎',
                desc: '一关不掉血通关，说明你已经完全读懂题面。',
                category: '实战',
                rarity: 'rare',
                statKey: 'perfectLevel',
                hint: '一关内不答错任何题。'
            }),
            createFlagAchievement({
                id: 'no_mistake',
                name: '一字不差',
                icon: '🎯',
                desc: '一整关题目全部答对，交出满答卷。',
                category: '实战',
                rarity: 'epic',
                statKey: 'perfectStreak',
                hint: '一关全部答对。'
            }),
            createFlagAchievement({
                id: 'survivor',
                name: '九死一生',
                icon: '🌟',
                desc: '只剩 1 条命时仍然完成关卡。',
                category: '实战',
                rarity: 'epic',
                statKey: 'oneLifeWin',
                hint: '残血完成一关。'
            }),
            createThresholdAchievement({
                id: 'scholar',
                name: '勤学苦练',
                icon: '📚',
                desc: '修炼场累计完成 10 题，先把基本功练稳。',
                category: '修炼',
                rarity: 'common',
                statKey: 'practiceCount',
                target: 10,
                suffix: '题',
                hint: '在修炼场完成 10 题。'
            }),
            createThresholdAchievement({
                id: 'practice_veteran',
                name: '修炼老将',
                icon: '🧘',
                desc: '修炼场累计完成 30 题，说明你真的在持续打磨。',
                category: '修炼',
                rarity: 'rare',
                statKey: 'practiceCount',
                target: 30,
                suffix: '题',
                hint: '在修炼场完成 30 题。'
            }),
            createCustomAchievement({
                id: 'clean_sheet',
                name: '纸面如新',
                icon: '🧼',
                desc: '累计作答至少 20 题后，整体正确率仍保持在 90% 以上。',
                category: '修炼',
                rarity: 'rare',
                hint: '先完成 20 题，再把正确率稳定在 90%。',
                getProgress: (stats) => {
                    const accuracy = Math.round((stats.accuracy || 0) * 100);
                    return {
                        current: accuracy,
                        target: 90,
                        ratio: Math.min(accuracy / 90, 1),
                        complete: stats.totalQuestions >= 20 && accuracy >= 90,
                        label: `${accuracy}% / 90% · 至少 20 题`
                    };
                },
                condition: (stats) => stats.totalQuestions >= 20 && (stats.accuracy || 0) >= 0.9
            }),
            createFlagAchievement({
                id: 'master_of_operators',
                name: '单元毕业',
                icon: '🎓',
                desc: '完成当前单元的全部关卡，拿到阶段性毕业证明。',
                category: '探索',
                rarity: 'rare',
                statKey: 'currentUnitCleared',
                hint: '先把一个单元全部通关。'
            }),
            createThresholdAchievement({
                id: 'star_collector',
                name: '星光收藏家',
                icon: '🌠',
                desc: '累计获得 12 颗星星，说明你的稳定性开始成型。',
                category: '探索',
                rarity: 'rare',
                statKey: 'totalStars',
                target: 12,
                hint: '累计拿到 12 颗星。'
            }),
            createThresholdAchievement({
                id: 'unit_crown',
                name: '单元加冕',
                icon: '🏅',
                desc: '单个单元累计拿满 18 星，说明你已经完全吃透这一章。',
                category: '探索',
                rarity: 'epic',
                statKey: 'bestUnitStars',
                target: 18,
                hint: '把任意一个单元刷到满星。'
            }),
            createFlagAchievement({
                id: 'dual_unit_clear',
                name: '双线通关',
                icon: '🧭',
                desc: '完成全部学习单元，真正打通当前内容地图。',
                category: '探索',
                rarity: 'legendary',
                statKey: 'allUnitsCleared',
                hint: '完成全部单元。'
            }),
            createThresholdAchievement({
                id: 'extreme_scout',
                name: '极限侦察兵',
                icon: '🛡️',
                desc: '完成任意一次极限测试，证明你敢进高压区。',
                category: '极限',
                rarity: 'epic',
                statKey: 'extremePasses',
                target: 1,
                suffix: '次',
                hint: '先通过 1 次极限测试。'
            }),
            createThresholdAchievement({
                id: 'extreme_conqueror',
                name: '零失误通关',
                icon: '👑',
                desc: '通过一次双单元综合大考，把极限模式打穿。',
                category: '极限',
                rarity: 'legendary',
                statKey: 'extremeDualPasses',
                target: 1,
                suffix: '次',
                hint: '通过 1 次双单元综合大考。'
            })
        ];

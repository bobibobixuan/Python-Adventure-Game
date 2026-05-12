UNITS = [
    {
        "id": 1, "name": "第一单元：运算符进阶", "icon": "➕", "subtitle": "各类运算符的详解",
        "description": "从最简单的算式开始，学会让电脑按顺序计算和判断。",
        "learning_goal": "先把表达式怎么计算、真假怎么判断弄明白。",
        "coach_line": "别急着背规则，先把每个符号当成会做什么的小工具来看。",
        "starter_tip": "第一次建议先打通前两关，再回修炼场把算式题刷顺。",
        "color": "#ffd700", "sort_order": 0,
    },
    {
        "id": 2, "name": "第二单元：If语句基础", "icon": "🚦", "subtitle": "条件判断的基础概念",
        "description": "学会先判断条件，再决定程序接下来要走哪一条路。",
        "learning_goal": "练会先判断条件，再决定走哪条分支的思维。",
        "coach_line": "把条件想成要不要过关的问题，先看真假，再看动作。",
        "starter_tip": "建议边读题边用纸笔写出条件真假和变量变化。",
        "color": "#667eea", "sort_order": 1,
    },
    {
        "id": 3, "name": "第三单元：循环入门", "icon": "🔁", "subtitle": "重复执行与流程控制",
        "description": "学会让程序把同一件事重复做好几次，建立真正的代码流程感。",
        "learning_goal": "把执行几次、什么时候停、每次变量怎么变看清楚。",
        "coach_line": "做循环题时不要跳着看，一轮一轮地写下来，答案就会自己出现。",
        "starter_tip": "先盯住循环次数，再一轮一轮模拟变量变化，会轻松很多。",
        "color": "#36cfc9", "sort_order": 2,
    },
]

LEVELS = [
    # Unit 1 (unit_id=1)
    {"unit_id": 1, "name": "算术运算符", "icon": "➕", "bg": "🌄", "questions_count": 5, "sort_order": 0},
    {"unit_id": 1, "name": "比较运算符", "icon": "⚖️", "bg": "🏛️", "questions_count": 5, "sort_order": 1},
    {"unit_id": 1, "name": "逻辑运算符", "icon": "🧠", "bg": "⚡", "questions_count": 5, "sort_order": 2},
    {"unit_id": 1, "name": "赋值运算符", "icon": "📝", "bg": "📜", "questions_count": 5, "sort_order": 3},
    {"unit_id": 1, "name": "成员运算符", "icon": "🔍", "bg": "🔮", "questions_count": 5, "sort_order": 4},
    {"unit_id": 1, "name": "综合挑战", "icon": "🏆", "bg": "🎯", "questions_count": 5, "sort_order": 5},
    # Unit 2 (unit_id=2)
    {"unit_id": 2, "name": "基础if语句", "icon": "🚦", "bg": "🔰", "questions_count": 5, "sort_order": 0},
    {"unit_id": 2, "name": "if-else双分支", "icon": "🔀", "bg": "🛤️", "questions_count": 5, "sort_order": 1},
    {"unit_id": 2, "name": "elif多重分支", "icon": "🚥", "bg": "🌈", "questions_count": 5, "sort_order": 2},
    {"unit_id": 2, "name": "嵌套条件结构", "icon": "🪆", "bg": "🕸️", "questions_count": 5, "sort_order": 3},
    {"unit_id": 2, "name": "隐式真假值", "icon": "🎭", "bg": "☯️", "questions_count": 5, "sort_order": 4},
    {"unit_id": 2, "name": "综合挑战", "icon": "🏆", "bg": "🎯", "questions_count": 5, "sort_order": 5},
    # Unit 3 (unit_id=3)
    {"unit_id": 3, "name": "for循环入门", "icon": "🔂", "bg": "🌱", "questions_count": 5, "sort_order": 0},
    {"unit_id": 3, "name": "range与计数", "icon": "🔢", "bg": "🧮", "questions_count": 5, "sort_order": 1},
    {"unit_id": 3, "name": "while循环", "icon": "🔄", "bg": "⏳", "questions_count": 5, "sort_order": 2},
    {"unit_id": 3, "name": "break与continue", "icon": "🛑", "bg": "🚧", "questions_count": 5, "sort_order": 3},
    {"unit_id": 3, "name": "循环嵌套", "icon": "🧩", "bg": "🧱", "questions_count": 5, "sort_order": 4},
    {"unit_id": 3, "name": "综合挑战", "icon": "🏆", "bg": "🎯", "questions_count": 5, "sort_order": 5},
]

ACHIEVEMENTS = [
    {"id": "first_win", "name": "初试锋芒", "icon": "🌱", "description": "首次答对题目，正式踏入闯关之路。", "hint": "先答对 1 题。", "rarity": "common", "category": "启程", "condition_type": "total_correct", "condition_value": 1},
    {"id": "rookie_pacer", "name": "起步热身", "icon": "🥾", "description": "累计完成 10 道题，熟悉游戏节奏。", "hint": "累计作答 10 题。", "rarity": "common", "category": "启程", "condition_type": "total_questions", "condition_value": 10},
    {"id": "question_hunter", "name": "百题斩", "icon": "🗡️", "description": "累计完成 100 道题，正式迈入高强度训练。", "hint": "累计作答 100 题。", "rarity": "epic", "category": "启程", "condition_type": "total_questions", "condition_value": 100},
    {"id": "score_apprentice", "name": "积分学徒", "icon": "🪙", "description": "总积分达到 1000，开始稳定积累。", "hint": "累计总积分达到 1000。", "rarity": "rare", "category": "启程", "condition_type": "score", "condition_value": 1000},
    {"id": "score_architect", "name": "积分建筑师", "icon": "🏛️", "description": "总积分达到 5000，说明你已经刷出稳定实力。", "hint": "累计总积分达到 5000。", "rarity": "legendary", "category": "启程", "condition_type": "score", "condition_value": 5000},
    {"id": "speed_demon", "name": "速算达人", "icon": "⚡", "description": "在 5 秒内答对 1 题，手速与思路同时在线。", "hint": "在 5 秒内答对 1 题。", "rarity": "rare", "category": "节奏", "condition_type": "fast_answer", "condition_value": 1},
    {"id": "combo_master", "name": "连击大师", "icon": "🔥", "description": "连续答对 5 题，把节奏稳稳接住。", "hint": "把最高连击推到 5。", "rarity": "rare", "category": "节奏", "condition_type": "max_combo", "condition_value": 5},
    {"id": "combo_emperor", "name": "连击帝王", "icon": "🌋", "description": "连续答对 10 题，进入无缝输出状态。", "hint": "把最高连击推到 10。", "rarity": "epic", "category": "节奏", "condition_type": "max_combo", "condition_value": 10},
    {"id": "speed_5", "name": "快如闪电", "icon": "💨", "description": "连续 5 题都在 5 秒内答对，节奏直接拉满。", "hint": "连续 5 题 5 秒内答对。", "rarity": "epic", "category": "节奏", "condition_type": "fast_streak", "condition_value": 5},
    {"id": "perfect_clear", "name": "零伤通关", "icon": "💎", "description": "一关不掉血通关，说明你已经完全读懂题面。", "hint": "一关内不答错任何题。", "rarity": "rare", "category": "实战", "condition_type": "perfect_level", "condition_value": 1},
    {"id": "no_mistake", "name": "一字不差", "icon": "🎯", "description": "一整关题目全部答对，交出满答卷。", "hint": "一关全部答对。", "rarity": "epic", "category": "实战", "condition_type": "perfect_streak", "condition_value": 1},
    {"id": "survivor", "name": "九死一生", "icon": "🌟", "description": "只剩 1 条命时仍然完成关卡。", "hint": "残血完成一关。", "rarity": "epic", "category": "实战", "condition_type": "one_life_win", "condition_value": 1},
    {"id": "scholar", "name": "勤学苦练", "icon": "📚", "description": "修炼场累计完成 10 题，先把基本功练稳。", "hint": "在修炼场完成 10 题。", "rarity": "common", "category": "修炼", "condition_type": "practice_count", "condition_value": 10},
    {"id": "practice_veteran", "name": "修炼老将", "icon": "🧘", "description": "修炼场累计完成 30 题，说明你真的在持续打磨。", "hint": "在修炼场完成 30 题。", "rarity": "rare", "category": "修炼", "condition_type": "practice_count", "condition_value": 30},
    {"id": "clean_sheet", "name": "纸面如新", "icon": "🧼", "description": "累计作答至少 20 题后，整体正确率仍保持在 90% 以上。", "hint": "先完成 20 题，再把正确率稳定在 90%。", "rarity": "rare", "category": "修炼", "condition_type": "accuracy", "condition_value": 90},
    {"id": "master_of_operators", "name": "单元毕业", "icon": "🎓", "description": "完成当前单元的全部关卡，拿到阶段性毕业证明。", "hint": "先把一个单元全部通关。", "rarity": "rare", "category": "探索", "condition_type": "unit_cleared", "condition_value": 1},
    {"id": "star_collector", "name": "星光收藏家", "icon": "🌠", "description": "累计获得 12 颗星星，说明你的稳定性开始成型。", "hint": "累计拿到 12 颗星。", "rarity": "rare", "category": "探索", "condition_type": "total_stars", "condition_value": 12},
    {"id": "unit_crown", "name": "单元加冕", "icon": "🏅", "description": "单个单元累计拿满 18 星，说明你已经完全吃透这一章。", "hint": "把任意一个单元刷到满星。", "rarity": "epic", "category": "探索", "condition_type": "max_unit_stars", "condition_value": 18},
    {"id": "dual_unit_clear", "name": "双线通关", "icon": "🧭", "description": "完成全部学习单元，真正打通当前内容地图。", "hint": "完成全部单元。", "rarity": "legendary", "category": "探索", "condition_type": "all_units_cleared", "condition_value": 1},
    {"id": "extreme_scout", "name": "极限侦察兵", "icon": "🛡️", "description": "完成任意一次极限测试，证明你敢进高压区。", "hint": "先通过 1 次极限测试。", "rarity": "epic", "category": "极限", "condition_type": "extreme_passes", "condition_value": 1},
    {"id": "extreme_conqueror", "name": "零失误通关", "icon": "👑", "description": "通过一次双单元综合大考，把极限模式打穿。", "hint": "通过 1 次双单元综合大考。", "rarity": "legendary", "category": "极限", "condition_type": "extreme_dual_passes", "condition_value": 1},
]

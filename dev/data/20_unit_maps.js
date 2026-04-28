const unitQuestionsMap = {
            0: unit1Questions,
            1: unit2Questions,
            2: unit3Questions
        };

// 单元关卡配置
        const unitLevelsMap = {
            0: [
                { name: '算术运算符', icon: '➕', bg: '🌄', questions: 5 },
                { name: '比较运算符', icon: '⚖️', bg: '🏛️', questions: 5 },
                { name: '逻辑运算符', icon: '🧠', bg: '⚡', questions: 5 },
                { name: '赋值运算符', icon: '📝', bg: '📜', questions: 5 },
                { name: '成员运算符', icon: '🔍', bg: '🔮', questions: 5 },
                { name: '综合挑战', icon: '🏆', bg: '🎯', questions: 5 }
            ],
            1: [
                { name: '基础if语句', icon: '🚦', bg: '🔰', questions: 5 },
                { name: 'if-else双分支', icon: '🔀', bg: '🛤️', questions: 5 },
                { name: 'elif多重分支', icon: '🚥', bg: '🌈', questions: 5 },
                { name: '嵌套条件结构', icon: '🪆', bg: '🕸️', questions: 5 },
                { name: '隐式真假值', icon: '🎭', bg: '☯️', questions: 5 },
                { name: '综合挑战', icon: '🏆', bg: '🎯', questions: 5 }
            ],
            2: [
                { name: 'for循环入门', icon: '🔂', bg: '🌱', questions: 5 },
                { name: 'range与计数', icon: '🔢', bg: '🧮', questions: 5 },
                { name: 'while循环', icon: '🔄', bg: '⏳', questions: 5 },
                { name: 'break与continue', icon: '🛑', bg: '🚧', questions: 5 },
                { name: '循环嵌套', icon: '🧩', bg: '🧱', questions: 5 },
                { name: '综合挑战', icon: '🏆', bg: '🎯', questions: 5 }
            ]
        };

// 成就元数据

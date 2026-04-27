// 单元配置
        const units = [
            {
                id: 0,
                name: '第一单元：运算符进阶',
                icon: '➕',
                subtitle: '各类运算符的详解',
                description: '深入学习算术、比较、逻辑、赋值、成员等运算符的用法',
                levels: 6,
                color: '#ffd700'
            },
            {
                id: 1,
                name: '第二单元：If语句基础',
                icon: '🚦',
                subtitle: '条件判断的基础概念',
                description: '学习Python的If语句，包括基础if、if-else、elif等多种条件结构',
                levels: 6,
                color: '#667eea'
            }
        ];

// 第一单元：If语句题目数据
        const unit1Questions = [
            // ================= 第1关：基础if语句 (5道) =================
            {
                id: 101,
                category: '基础if语句',
                categoryId: 0,
                type: '选择题',
                content: '在Python中，<code>if</code> 语句条件部分的末尾必须使用什么符号？',
                answer: 'C',
                options: [
                    { letter: 'A', text: '分号 ;' },
                    { letter: 'B', text: '逗号 ,' },
                    { letter: 'C', text: '冒号 :' },
                    { letter: 'D', text: '句号 .' }
                ],
                knowledge: {
                    meaning: '冒号在Python中代表接下来是一个代码块（需要缩进）。',
                    rule: '所有复合语句（如 if, for, while, def 等）的首行都必须以冒号结尾。',
                    error: '初学者极易漏写冒号，这会导致 SyntaxError（语法错误）。',
                    example: '<code>if x > 0:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print("Yes")</code>'
                }
            },
            {
                id: 102,
                category: '基础if语句',
                categoryId: 0,
                type: '判断题',
                content: '在 <code>if</code> 语句下方属于该条件分支的代码，必须要有相同的缩进。',
                answer: 'true',
                knowledge: {
                    meaning: 'Python通过缩进来判断代码的层级关系，缩进相同的代码属于同一个代码块。',
                    rule: '标准缩进是4个空格，同一代码块内的缩进空格数必须绝对一致。',
                    error: '不要混用Tab和空格，否则会报 IndentationError（缩进错误）。',
                    example: '<code>if True:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;a = 1</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;b = 2</code>'
                }
            },
            {
                id: 103,
                category: '基础if语句',
                categoryId: 0,
                type: '填空题',
                content: '执行代码：<br><code>x = 5<br>if x > 3:<br>&nbsp;&nbsp;&nbsp;&nbsp;x = x + 2<br>print(x)</code><br>输出结果是 ',
                answer: '7',
                knowledge: {
                    meaning: '5大于3，条件成立，执行缩进块内的代码，x变为7。',
                    rule: '只有if条件结果为True时，才会执行其内部的缩进代码。',
                    error: '如果不注意判断条件是否成立，容易算错最终的变量值。',
                    example: '条件成立，执行 <code>x = 5 + 2</code>。'
                }
            },
            {
                id: 104,
                category: '基础if语句',
                categoryId: 0,
                type: '选择题',
                content: '以下哪个 <code>if</code> 语句的写法是正确的？',
                answer: 'A',
                options: [
                    { letter: 'A', text: '<code>if a == 10:</code>' },
                    { letter: 'B', text: '<code>if a = 10:</code>' },
                    { letter: 'C', text: '<code>if (a == 10)</code>' },
                    { letter: 'D', text: '<code>if a == 10</code>' }
                ],
                knowledge: {
                    meaning: '正确写法必须包含比较运算符(==)和末尾的冒号(:)。',
                    rule: '在条件判断中，判断相等必须用双等号 `==`，单等号 `=` 是赋值。',
                    error: '写成 `if a = 10:` 是最常见的语法错误，Python不支持在if中直接赋值。',
                    example: '<code>if a == 10:</code>'
                }
            },
            {
                id: 105,
                category: '基础if语句',
                categoryId: 0,
                type: '填空题',
                content: '执行代码：<br><code>a = 10<br>if a < 5:<br>&nbsp;&nbsp;&nbsp;&nbsp;a = 0<br>print(a)</code><br>输出结果是 ',
                answer: '10',
                knowledge: {
                    meaning: '因为10 < 5为假（False），所以跳过缩进的代码，a的值保持不变。',
                    rule: '如果条件为False，程序会跳过整个if代码块，继续执行后面的未缩进代码。',
                    error: '不要盲目执行代码块里的内容，先判断条件真假！',
                    example: '跳过 <code>a = 0</code>，直接执行 <code>print(a)</code>。'
                }
            },

            // ================= 第2关：if-else双分支 (5道) =================
            {
                id: 106,
                category: 'if-else双分支',
                categoryId: 1,
                type: '判断题',
                content: '<code>else</code> 语句可以单独使用，不需要前面有 <code>if</code> 语句。',
                answer: 'false',
                knowledge: {
                    meaning: '`else` 的意思是"否则"，它必须依附于前面的 `if`（或 for/while/try）存在，不能孤立存在。',
                    rule: '一个标准的双分支结构是 `if...else...`，它们成对出现且缩进级别相同。',
                    error: '单独写 `else:` 会直接报语法错误（SyntaxError）。',
                    example: '正确：<code>if a > 0: ... else: ...</code>'
                }
            },
            {
                id: 107,
                category: 'if-else双分支',
                categoryId: 1,
                type: '填空题',
                content: '执行代码：<br><code>n = 4<br>if n % 2 == 0:<br>&nbsp;&nbsp;&nbsp;&nbsp;res = 1<br>else:<br>&nbsp;&nbsp;&nbsp;&nbsp;res = 2</code><br>res 的值是 ',
                answer: '1',
                knowledge: {
                    meaning: '4能被2整除（余数为0），所以执行 if 分支，不执行 else 分支。',
                    rule: '`if-else` 是互斥的，条件为True走if，为False走else，必定只走其中一条路。',
                    error: '切忌两条路都执行。判断为真后，else块会被直接忽略。',
                    example: '判断奇偶数是if-else的经典应用场景。'
                }
            },
            {
                id: 108,
                category: 'if-else双分支',
                categoryId: 1,
                type: '选择题',
                content: '关于 <code>else</code> 语句，以下说法错误的是？',
                answer: 'C',
                options: [
                    { letter: 'A', text: '<code>else</code> 后面不能加条件表达式' },
                    { letter: 'B', text: '<code>else</code> 必须和对应的 <code>if</code> 对齐' },
                    { letter: 'C', text: '一个 <code>if</code> 后面可以跟多个 <code>else</code>' },
                    { letter: 'D', text: '<code>else</code> 后面也必须加冒号' }
                ],
                knowledge: {
                    meaning: '一个 if 语句只能搭配最多一个 else（作为最后的保底分支）。',
                    rule: '结构只能是 `if -> (0个或多个elif) -> (0或1个else)`。',
                    error: '如果在代码中写两个并列的else，Python会报错。',
                    example: '错误示范：<code>if x>0: ... else: ... else: ...</code>'
                }
            },
            {
                id: 109,
                category: 'if-else双分支',
                categoryId: 1,
                type: '填空题',
                content: '执行代码：<br><code>x = -5<br>if x >= 0:<br>&nbsp;&nbsp;&nbsp;&nbsp;x = x + 5<br>else:<br>&nbsp;&nbsp;&nbsp;&nbsp;x = x - 5</code><br>最后 x 的值是 ',
                answer: '-10',
                knowledge: {
                    meaning: '-5 >= 0 为假，进入 else 分支，执行 -5 - 5 = -10。',
                    rule: '仔细代入初始变量值，按照条件走向计算最终结果。',
                    error: '注意负数的加减法，-5减去5是-10，不是0！',
                    example: '走else分支：<code>x = -5 - 5</code>'
                }
            },
            {
                id: 110,
                category: 'if-else双分支',
                categoryId: 1,
                type: '选择题',
                content: '如果想判断一个数 <code>x</code> 是否非负，并在负数时将其变正，应该选？',
                answer: 'B',
                options: [
                    { letter: 'A', text: '<code>if x > 0: x = -x</code>' },
                    { letter: 'B', text: '<code>if x < 0: x = -x</code>' },
                    { letter: 'C', text: '<code>else x < 0: x = -x</code>' },
                    { letter: 'D', text: '<code>if x < 0 else: x = -x</code>' }
                ],
                knowledge: {
                    meaning: '负数才需要变正，所以条件是 `x < 0`，将其变成相反数 `-x` 即为正数。',
                    rule: '这也是求绝对值（abs）的基础底层逻辑。',
                    error: 'C错在else后面不能加条件；D错在语法完全不通。',
                    example: '当 x = -3 时，进入 `if x < 0`，执行 `x = -(-3)`，x变为3。'
                }
            },

            // ================= 第3关：elif多重分支 (5道) =================
            {
                id: 111,
                category: 'elif多重分支',
                categoryId: 2,
                type: '选择题',
                content: '在多分支判断中，<code>elif</code> 是哪个英文短语的缩写？',
                answer: 'A',
                options: [
                    { letter: 'A', text: 'else if' },
                    { letter: 'B', text: 'every if' },
                    { letter: 'C', text: 'either if' },
                    { letter: 'D', text: 'end if' }
                ],
                knowledge: {
                    meaning: 'Python为了让代码更简洁，将 else if 组合成了 elif。',
                    rule: 'elif 必须用在 if 之后，else 之前。后面必须跟条件表达式和冒号。',
                    error: '不要在Python里写 `else if`，会报语法错误，必须写成 `elif`。',
                    example: '<code>elif score >= 80:</code>'
                }
            },
            {
                id: 112,
                category: 'elif多重分支',
                categoryId: 2,
                type: '填空题',
                content: '执行代码：<br><code>x = 8<br>if x > 10:<br>&nbsp;&nbsp;&nbsp;&nbsp;y = 1<br>elif x > 5:<br>&nbsp;&nbsp;&nbsp;&nbsp;y = 2<br>elif x > 0:<br>&nbsp;&nbsp;&nbsp;&nbsp;y = 3</code><br>y 的值是 ',
                answer: '2',
                knowledge: {
                    meaning: 'x是8，不大于10，看下一个条件；8大于5，条件成立，执行 y=2。',
                    rule: '从上到下按顺序判断，只要有一个条件成立，执行后就会**立刻跳出**整个 if-elif 结构。',
                    error: '不要因为8也大于0就执行 y=3。匹配到第一个满足的条件后就不会再往下判断了！',
                    example: '这就是为什么多分支结构要注意条件的先后顺序。'
                }
            },
            {
                id: 113,
                category: 'elif多重分支',
                categoryId: 2,
                type: '判断题',
                content: '一个多分支结构可以只有 <code>if</code> 和多个 <code>elif</code>，而不需要 <code>else</code> 结尾。',
                answer: 'true',
                knowledge: {
                    meaning: '`else` 是可选的（作为所有条件都不满足时的默认操作）。如果不需要默认操作，完全可以省略。',
                    rule: '`if-elif` 结构合法。如果没有任何条件满足，程序就直接略过整个结构继续向下执行。',
                    error: '很多人误以为if语句最后必须用else兜底，其实不是强制的。',
                    example: '<code>if a == 1: print("A")<br>elif a == 2: print("B")</code> （没有else完全合法）'
                }
            },
            {
                id: 114,
                category: 'elif多重分支',
                categoryId: 2,
                type: '选择题',
                content: '下面这段评级代码有一个逻辑漏洞，输入什么分数会得到错误的结果？<br><code>if score >= 60: return "及格"<br>elif score >= 90: return "优秀"</code>',
                answer: 'D',
                options: [
                    { letter: 'A', text: '50' },
                    { letter: 'B', text: '70' },
                    { letter: 'C', text: '85' },
                    { letter: 'D', text: '95' }
                ],
                knowledge: {
                    meaning: '输入95时，95>=60满足条件，直接返回"及格"并跳出，永远无法执行到"优秀"。',
                    rule: '在使用大于(>)判断时，条件范围小的（如>=90）应该写在前面，范围大的写在后面。',
                    error: '条件发生覆盖和重叠时，排在前面的条件会拦截排在后面的条件。',
                    example: '正确写法应先判断 <code>if score >= 90</code>，再判断 <code>elif score >= 60</code>。'
                }
            },
            {
                id: 115,
                category: 'elif多重分支',
                categoryId: 2,
                type: '填空题',
                content: '执行代码：<br><code>a = 3<br>if a == 1: a += 1<br>elif a == 2: a += 2<br>else: a += 3</code><br>最终 a 的值是 ',
                answer: '6',
                knowledge: {
                    meaning: '3既不等于1也不等于2，所以落入最后的else分支，执行 a = 3 + 3 = 6。',
                    rule: 'else 作为"垃圾桶"分支，收纳所有不符合前面条件的情况。',
                    error: '别看错了初始值和运算符号，a += 3 就是 a = a + 3。',
                    example: '<code>else:</code> 处理所有其他情况。'
                }
            },

            // ================= 第4关：嵌套条件结构 (5道) =================
            {
                id: 116,
                category: '嵌套条件结构',
                categoryId: 3,
                type: '判断题',
                content: '在Python中，<code>if</code> 语句内部不可以再包含另一个 <code>if-else</code> 结构。',
                answer: 'false',
                knowledge: {
                    meaning: '条件语句是可以嵌套的，你可以在一个if里面再写if，层次理论上不限。',
                    rule: '嵌套时一定要严格注意**缩进**。内部的if要比外部的if多一层缩进（通常多4个空格）。',
                    error: '嵌套层数过多（超过3层）会导致代码像"箭头"一样，可读性极差，被称为"回调地狱/嵌套地狱"。',
                    example: '<code>if 晴天:<br>&nbsp;&nbsp;if 有空:<br>&nbsp;&nbsp;&nbsp;&nbsp;去打球</code>'
                }
            },
            {
                id: 117,
                category: '嵌套条件结构',
                categoryId: 3,
                type: '填空题',
                content: '执行代码：<br><code>x, y = 10, 5<br>if x > 5:<br>&nbsp;&nbsp;&nbsp;&nbsp;if y > 5:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ans = "A"<br>&nbsp;&nbsp;&nbsp;&nbsp;else:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ans = "B"<br>else:<br>&nbsp;&nbsp;&nbsp;&nbsp;ans = "C"</code><br>ans 的值是 ',
                answer: 'B',
                knowledge: {
                    meaning: '第一层 x>5(10>5) 成立；进入内层判断 y>5(5>5) 为假，走内层的 else，得到 "B"。',
                    rule: '外层条件满足后，才会进入内层判断；内层的 else 只与同缩进级别的内层 if 匹配。',
                    error: '不要把内层的 else 和外层的 else 看混了，对齐（缩进）是谁，就和谁配对！',
                    example: '缩进决定了代码的归属关系。'
                }
            },
            {
                id: 118,
                category: '嵌套条件结构',
                categoryId: 3,
                type: '选择题',
                content: '下面哪段代码等价于 <code>if a > 0 and b > 0:</code> ？',
                answer: 'A',
                options: [
                    { letter: 'A', text: '<code>if a > 0:<br>&nbsp;&nbsp;if b > 0:</code>' },
                    { letter: 'B', text: '<code>if a > 0:<br>if b > 0:</code>' },
                    { letter: 'C', text: '<code>if a > 0 or b > 0:</code>' },
                    { letter: 'D', text: '<code>if a > 0 elif b > 0:</code>' }
                ],
                knowledge: {
                    meaning: '嵌套的两个 if，意味着必须同时满足条件a且满足条件b才能进入最深层，逻辑上等同于 `and`。',
                    rule: '可以通过逻辑运算符（and）来合并简单的嵌套 if，让代码更扁平化。',
                    error: 'B选项没有缩进，是两个并列的if，逻辑完全不同。',
                    example: '优先使用 `and`，避免不必要的嵌套。'
                }
            },
            {
                id: 119,
                category: '嵌套条件结构',
                categoryId: 3,
                type: '填空题',
                content: '执行代码：<br><code>a = 0<br>if a == 0:<br>&nbsp;&nbsp;&nbsp;&nbsp;a += 1<br>&nbsp;&nbsp;&nbsp;&nbsp;if a == 1:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a += 2<br>print(a)</code><br>输出结果是 ',
                answer: '3',
                knowledge: {
                    meaning: '外层 a==0 成立，a变成1；继续往下走遇到内层 if a==1，条件成立，a变成1+2=3。',
                    rule: '代码是自上而下执行的，外层修改了变量的值，内层使用的就是修改后的新值。',
                    error: '不要拿初始值 a=0 去判断内层的 if！变量的值是在动态变化的。',
                    example: '程序执行过程：0 -> 1 -> 3'
                }
            },
            {
                id: 120,
                category: '嵌套条件结构',
                categoryId: 3,
                type: '选择题',
                content: '关于嵌套条件，在排版时最容易出现的错误是什么？',
                answer: 'D',
                options: [
                    { letter: 'A', text: '变量名写错' },
                    { letter: 'B', text: '忘记导入模块' },
                    { letter: 'C', text: '条件全部为真' },
                    { letter: 'D', text: '缩进混乱导致逻辑错乱' }
                ],
                knowledge: {
                    meaning: '嵌套越深，对缩进的要求就越严格。少缩进或多缩进，会完全改变代码的执行流。',
                    rule: 'Python强制使用缩进来划分代码块，因此缩进就是逻辑本身。',
                    error: '一旦缩进对齐错误，原本属于内层的代码可能会被解析到外层，导致难以排查的Bug。',
                    example: '多使用IDE的自动缩进和格式化工具(如Shift+Tab回退缩进)。'
                }
            },

            // ================= 第5关：隐式真假值 (5道) =================
            {
                id: 121,
                category: '隐式真假值',
                categoryId: 4,
                type: '选择题',
                content: '在Python中，如果直接将变量作为条件（如 <code>if x:</code>），下列哪个值会被判定为 <code>False</code>？',
                answer: 'C',
                options: [
                    { letter: 'A', text: '<code>"0"</code> (字符串)' },
                    { letter: 'B', text: '<code>[1]</code> (列表)' },
                    { letter: 'C', text: '<code>0</code> (整数)' },
                    { letter: 'D', text: '<code>-1</code> (整数)' }
                ],
                knowledge: {
                    meaning: 'Python中，数字 0 被视为 False。非零数字（包括-1）都是 True。',
                    rule: '常用的 False 隐式值：0, 0.0, ""(空字符串), [](空列表), {}(空字典), None。',
                    error: '初学者常以为字符串 `"0"` 是 False。只要字符串不为空（里面有字符），哪怕是"0"或"False"，它就是True！',
                    example: '<code>if 0:</code> 不会执行，<code>if "0":</code> 会执行。'
                }
            },
            {
                id: 122,
                category: '隐式真假值',
                categoryId: 4,
                type: '判断题',
                content: '代码 <code>if "":</code> 中的条件被认为是 <code>True</code>。',
                answer: 'false',
                knowledge: {
                    meaning: '空字符串 `""` 在布尔语境下会被转换为 False。',
                    rule: '所有为空的数据结构（空列表、空元组、空字符串、空字典、空集合）都是 False。',
                    error: '非空为真，空为假。非常适合用来检查用户是否输入了内容。',
                    example: '<code>name = ""<br>if not name: print("名字不能为空")</code>'
                }
            },
            {
                id: 123,
                category: '隐式真假值',
                categoryId: 4,
                type: '填空题',
                content: '执行代码：<br><code>a = []<br>if a:<br>&nbsp;&nbsp;&nbsp;&nbsp;res = "满"<br>else:<br>&nbsp;&nbsp;&nbsp;&nbsp;res = "空"</code><br>res 的值是 ',
                answer: '空',
                knowledge: {
                    meaning: '`a` 是一个空列表 `[]`，被视为 False，因此走 else 分支。',
                    rule: '利用 `if 列表:` 可以非常优雅地判断列表是否为空，无需使用 `len(a) > 0`。',
                    error: '写成 `if len(a) > 0:` 虽然对，但不符合Pythonic（优雅的Python代码）风格。',
                    example: '推荐写法：<code>if a:</code> 而不是 <code>if len(a) != 0:</code>'
                }
            },
            {
                id: 124,
                category: '隐式真假值',
                categoryId: 4,
                type: '填空题',
                content: '执行代码：<br><code>if "False":<br>&nbsp;&nbsp;&nbsp;&nbsp;ans = "T"<br>else:<br>&nbsp;&nbsp;&nbsp;&nbsp;ans = "F"</code><br>ans 的值是 ',
                answer: 'T',
                knowledge: {
                    meaning: '"False" 是一个包含5个字母的字符串，不是空的！非空字符串即为 True。',
                    rule: '带引号的布尔词只是普通字符串，不要被文字含义迷惑。',
                    error: '很多人会条件反射地认为它代表假，这是极易踩坑的地方。',
                    example: '只有不带引号的 <code>False</code> 才是真正的假。'
                }
            },
            {
                id: 125,
                category: '隐式真假值',
                categoryId: 4,
                type: '选择题',
                content: '关于 <code>None</code>，以下哪个表达式等价于检查变量 <code>x</code> 是不是 <code>None</code>？',
                answer: 'D',
                options: [
                    { letter: 'A', text: '<code>if x == False:</code>' },
                    { letter: 'B', text: '<code>if x == 0:</code>' },
                    { letter: 'C', text: '<code>if x == "":</code>' },
                    { letter: 'D', text: '<code>if x is None:</code>' }
                ],
                knowledge: {
                    meaning: 'None 是Python中一个特殊类型（NoneType），代表"什么都没有"。',
                    rule: '判断是否为None，官方推荐使用身份运算符 `is`，即 `if x is None:`。',
                    error: 'None不是0，不是False，更不是空字符串，它就是单独存在的None。',
                    example: '<code>if x is not None:</code> （判断x有实际值）'
                }
            },

            // ================= 第6关：综合与进阶 (5道) =================
            {
                id: 126,
                category: '综合挑战',
                categoryId: 5,
                type: '选择题',
                content: '执行代码：<code>res = 10 if 5 > 3 else 20</code>，res 的值是多少？',
                answer: 'A',
                options: [
                    { letter: 'A', text: '10' },
                    { letter: 'B', text: '20' },
                    { letter: 'C', text: '5' },
                    { letter: 'D', text: '3' }
                ],
                knowledge: {
                    meaning: '这是Python的三元条件表达式。因为 5>3 为True，所以返回 if 前面的值 10。',
                    rule: '语法格式：`为真时的值 if 条件 else 为假时的值`。',
                    error: '不要和C/Java里的 `条件 ? 真值 : 假值` 搞混，Python把条件写在中间。',
                    example: '<code>status = "成年" if age >= 18 else "未成年"</code>'
                }
            },
            {
                id: 127,
                category: '综合挑战',
                categoryId: 5,
                type: '判断题',
                content: '三元条件表达式 (<code>A if cond else B</code>) 中，可以嵌入 <code>elif</code> 逻辑。',
                answer: 'false',
                knowledge: {
                    meaning: '三元表达式只支持简单的 if-else 双向分支，不支持 elif。',
                    rule: '如果需要多分支，必须使用标准的多行 if-elif-else 语句，或者嵌套三元表达式（极度不推荐）。',
                    error: '尝试在单行表达式里写 elif 会导致 SyntaxError。',
                    example: '不推荐的嵌套写法：<code>A if c1 else (B if c2 else C)</code>，可读性很差。'
                }
            },
            {
                id: 128,
                category: '综合挑战',
                categoryId: 5,
                type: '填空题',
                content: '执行代码：<br><code>a = 5<br>b = 3<br>if a > 2 and b < 5:<br>&nbsp;&nbsp;&nbsp;&nbsp;c = a + b<br>else:<br>&nbsp;&nbsp;&nbsp;&nbsp;c = a - b</code><br>c 的值是 ',
                answer: '8',
                knowledge: {
                    meaning: 'a>2(True) 且 b<5(True)，两边都成立，and结果为True。执行 c = 5 + 3 = 8。',
                    rule: '条件分支经常结合逻辑运算符 `and`, `or`, `not` 一起使用。',
                    error: 'and 需要左右两边都是 True 整体才算 True。',
                    example: '如果改为 <code>a > 2 or b > 5</code>，结果依然为True。'
                }
            },
            {
                id: 129,
                category: '综合挑战',
                categoryId: 5,
                type: '选择题',
                content: '有如下代码：<br><code>if not (x > 10): print("A")</code><br>如果想让它输出 "A"，x 的值可以是？',
                answer: 'B',
                options: [
                    { letter: 'A', text: '15' },
                    { letter: 'B', text: '5' },
                    { letter: 'C', text: '11' },
                    { letter: 'D', text: '100' }
                ],
                knowledge: {
                    meaning: '`not (x > 10)` 要为 True，说明 `x > 10` 必须为 False。所以 x 不能大于 10。',
                    rule: '`not` 会将条件的布尔值取反。`not (x > 10)` 在数学上等价于 `x <= 10`。',
                    error: '遇到 not 时，先算括号里面的结果，然后再翻转真假。',
                    example: '当 x=5 时，5>10为False，not False即为True。'
                }
            },
            {
                id: 130,
                category: '综合挑战',
                categoryId: 5,
                type: '填空题',
                content: '执行下面这行紧凑的代码：<br><code>x = "偶" if 8 % 2 == 0 else "奇"</code><br>x 的值是 ',
                answer: '偶',
                knowledge: {
                    meaning: '8 % 2 的余数是 0，0 == 0 为 True，所以取 if 前面的值 "偶"。',
                    rule: '三元表达式非常适合给变量做快速赋值。',
                    error: '先计算条件 `8 % 2 == 0`，再决定选用前面还是后面的值。',
                    example: '这是代替简单 `if-else` 给单个变量赋值的最佳实践方案。'
                }
            }
        ];

// 第二单元：运算符题目
        const unit2Questions = [
            {
                id: 1,
                category: '算术运算符',
                categoryId: 0,
                type: '填空题',
                content: '<code>10 + 5 * 2</code> 的结果是 ',
                answer: '20',
                knowledge: {
                    meaning: '先算乘法5×2=10，再算加法10+10=20。',
                    rule: '乘除比加减优先级高，先算5×2。',
                    error: '容易先算10+5=15，再×2=30。记住：先乘除后加减！',
                    example: '<code>10 + 5 * 2 = 20</code><br><code>(10 + 5) * 2 = 30</code>'
                }
            },
            {
                id: 2,
                category: '算术运算符',
                categoryId: 0,
                type: '选择题',
                content: '下列哪个表达式结果为奇数？',
                answer: 'B',
                options: [
                    { letter: 'A', text: '<code>10 % 2</code>' },
                    { letter: 'B', text: '<code>15 % 2</code>' },
                    { letter: 'C', text: '<code>20 % 2</code>' },
                    { letter: 'D', text: '<code>100 % 2</code>' }
                ],
                knowledge: {
                    meaning: '%是取余数，15÷2=7余1，所以15%2=1（奇数）。',
                    rule: '对2取余：结果0是偶数，结果1是奇数。',
                    error: '不要把%和/搞混，/是除法，%是取余数。',
                    example: '<code>15 % 2 = 1</code>（奇数）<br><code>14 % 2 = 0</code>（偶数）'
                }
            },
            {
                id: 3,
                category: '算术运算符',
                categoryId: 0,
                type: '填空题',
                content: '<code>17 // 5</code> 的结果是 ',
                answer: '3',
                knowledge: {
                    meaning: '17÷5=3.4，//是整除，只取整数部分3。',
                    rule: '//只取结果的整数部分，小数部分不要。',
                    error: '不是四舍五入！17//5=3，不是3.4，也不是4。',
                    example: '<code>17 // 5 = 3</code><br><code>17 / 5 = 3.4</code>'
                }
            },
            {
                id: 4,
                category: '算术运算符',
                categoryId: 0,
                type: '判断题',
                content: '<code>2 ** 3 ** 2</code> 的结果是 <code>64</code>。',
                answer: 'false',
                knowledge: {
                    meaning: '**从右往左算：先算3**2=9，再算2**9=512。',
                    rule: '**是右结合的，a**b**c等于a**(b**c)。',
                    error: '容易从左往右算成(2**3)**2=8**2=64。',
                    example: '<code>2 ** 3 ** 2 = 2 ** 9 = 512</code><br><code>(2 ** 3) ** 2 = 64</code>'
                }
            },
            {
                id: 5,
                category: '算术运算符',
                categoryId: 0,
                type: '选择题',
                content: '表达式 <code>(-10) % 3</code> 的结果是？',
                answer: 'D',
                options: [
                    { letter: 'A', text: '-1' },
                    { letter: 'B', text: '-2' },
                    { letter: 'C', text: '1' },
                    { letter: 'D', text: '2' }
                ],
                knowledge: {
                    meaning: '(-10)÷3=-3余-1，但Python规定结果要与除数同号，所以结果是2。简单记：Python取模结果永远是正的（当除数是正数时）。',
                    rule: 'Python的%结果符号与除数相同，除数3是正数，所以结果是正数。',
                    error: '不要以为负数取模结果是负数！Python保证结果和除数同号。',
                    example: '<code>(-10) % 3 = 2</code><br><code>10 % (-3) = -2</code>'
                }
            },
            {
                id: 6,
                category: '比较运算符',
                categoryId: 1,
                type: '判断题',
                content: '<code>3 == 3.0</code> 的结果是 <code>True</code>。',
                answer: 'true',
                knowledge: {
                    meaning: '3和3.0数值相等，==只比较值，不比较类型。',
                    rule: '整数和浮点数只要数值相等，==就返回True。',
                    error: '不要把==和is搞混！==比较值，is比较内存地址。',
                    example: '<code>3 == 3.0</code> → <code>True</code><br><code>3 is 3.0</code> → <code>False</code>'
                }
            },
            {
                id: 7,
                category: '比较运算符',
                categoryId: 1,
                type: '选择题',
                content: '下列表达式中，结果为 <code>False</code> 的是？',
                answer: 'D',
                options: [
                    { letter: 'A', text: '<code>"hello" == "hello"</code>' },
                    { letter: 'B', text: '<code>[1,2] == [1,2]</code>' },
                    { letter: 'C', text: '<code>"abc" < "bcd"</code>' },
                    { letter: 'D', text: '<code>"abc" > "abcd"</code>' }
                ],
                knowledge: {
                    meaning: '"abc"比"abcd"短，所以"abc"小于"abcd"，"abc">"abcd"是错的。',
                    rule: '字符串比较时，较短的字符串更小（当前缀相同时）。',
                    error: '不要觉得"abc"更长所以更大！字典序中短的在前。',
                    example: '<code>"abc" > "abcd"</code> → <code>False</code><br><code>"abc" < "abd"</code> → <code>True</code>'
                }
            },
            {
                id: 8,
                category: '比较运算符',
                categoryId: 1,
                type: '填空题',
                content: '<code>10 != 9</code> 的结果是 ',
                answer: 'True',
                knowledge: {
                    meaning: '10不等于9，所以正确。!=就是"不等于"的意思。',
                    rule: '!=表示不等于，相等返回False，不等返回True。',
                    error: '注意不要写成=!，那是错的。!=是!=，顺序不能换。',
                    example: '<code>10 != 9</code> → <code>True</code><br><code>10 != 10</code> → <code>False</code>'
                }
            },
            {
                id: 9,
                category: '比较运算符',
                categoryId: 1,
                type: '选择题',
                content: '表达式 <code>5 <= 5.0</code> 的结果是？',
                answer: 'A',
                options: [
                    { letter: 'A', text: 'True' },
                    { letter: 'B', text: 'False' },
                    { letter: 'C', text: '报错' },
                    { letter: 'D', text: 'None' }
                ],
                knowledge: {
                    meaning: '5和5.0相等，5<=5.0当然成立，返回True。',
                    rule: 'Python中整数和浮点数可以直接比较，会自动转换类型。',
                    error: '不要以为不同类型不能比较！Python数值类型可以跨类型比较。',
                    example: '<code>5 <= 5.0</code> → <code>True</code><br><code>5 == 5.0</code> → <code>True</code>'
                }
            },
            {
                id: 10,
                category: '比较运算符',
                categoryId: 1,
                type: '判断题',
                content: '在Python中，<code>None == 0</code> 的结果是 <code>True</code>。',
                answer: 'false',
                knowledge: {
                    meaning: 'None是Python的"空"，不等于0，也不等于False，各是各的。',
                    rule: 'None只和None相等，和其他任何值都不等。',
                    error: 'None不是0，不是空字符串，不是False，就是个特殊的"空"。',
                    example: '<code>None == 0</code> → <code>False</code><br><code>None == False</code> → <code>False</code><br><code>None == None</code> → <code>True</code>'
                }
            },
            {
                id: 11,
                category: '逻辑运算符',
                categoryId: 2,
                type: '填空题',
                content: '<code>3 > 2 and 5 > 4</code> 的结果是 ',
                answer: 'True',
                knowledge: {
                    meaning: '3>2是真，5>4是真，真and真=真。',
                    rule: 'and两边都为True结果才是True，有一个是False就是False。',
                    error: 'and不是"和"的意思，是"并且"，两边都要满足才成立。',
                    example: '<code>True and True</code> → <code>True</code><br><code>True and False</code> → <code>False</code>'
                }
            },
            {
                id: 12,
                category: '逻辑运算符',
                categoryId: 2,
                type: '选择题',
                content: '表达式 <code>not (3 < 5)</code> 的结果是？',
                answer: 'D',
                options: [
                    { letter: 'A', text: '3 < 5' },
                    { letter: 'B', text: 'True' },
                    { letter: 'C', text: '报错' },
                    { letter: 'D', text: 'False' }
                ],
                knowledge: {
                    meaning: '先算括号里3<5=真，再not真=假，所以结果是False。',
                    rule: 'not是取反：not True=False，not False=True。',
                    error: 'not 3<5容易报错，因为<优先级高于not。要加括号not(3<5)。',
                    example: '<code>not (3 < 5)</code> = <code>not True</code> = <code>False</code>'
                }
            },
            {
                id: 13,
                category: '逻辑运算符',
                categoryId: 2,
                type: '填空题',
                content: '<code>True or False and False</code> 的结果是 ',
                answer: 'True',
                knowledge: {
                    meaning: 'and优先级高于or，先算False and False=False，再算True or False=True。',
                    rule: '优先级：not > and > or。记忆：N-A-O（不打啊哦？）',
                    error: '容易从左往右算成True or False=True就结束了，忘了先算and。',
                    example: '<code>True or False and False</code> = <code>True or False</code> = <code>True</code><br><code>(True or False) and False</code> = <code>False</code>'
                }
            },
            {
                id: 14,
                category: '逻辑运算符',
                categoryId: 2,
                type: '选择题',
                content: '下列哪个表达式会输出 <code>hello</code>？',
                answer: 'C',
                options: [
                    { letter: 'A', text: '<code>False and "hello"</code>' },
                    { letter: 'B', text: '<code>True and ""</code>' },
                    { letter: 'C', text: '<code>True and "hello"</code>' },
                    { letter: 'D', text: '<code>"" and "hello"</code>' }
                ],
                knowledge: {
                    meaning: 'and/or不只是返回True/False，它返回实际参与的值！True and "hello"返回"hello"。',
                    rule: 'a and b：a为真返回b，a为假返回a。<br>a or b：a为真返回a，a为假返回b。',
                    error: '不要以为and/or只返回布尔值，它们返回的是实际的值！',
                    example: '<code>True and "hello"</code> → <code>"hello"</code><br><code>False and "hello"</code> → <code>False</code>'
                }
            },
            {
                id: 15,
                category: '逻辑运算符',
                categoryId: 2,
                type: '判断题',
                content: '<code>1 and 0</code> 的结果是 <code>False</code>。',
                answer: 'true',
                knowledge: {
                    meaning: '1是真，0是假。1 and 0返回的是第二个值0（0就是False）。',
                    rule: '1 and 0：第一个值1为真，所以返回第二个值0。',
                    error: '注意！返回的是0，不是False。虽然0在布尔语境下等于False，但它们不一样。',
                    example: '<code>1 and 0</code> → <code>0</code>（返回的是0，不是False）<br><code>bool(1 and 0)</code> → <code>False</code>'
                }
            },
            {
                id: 16,
                category: '赋值运算符',
                categoryId: 3,
                type: '选择题',
                content: '执行 <code>x = 5; x += 3</code> 后，x 的值是？',
                answer: 'B',
                options: [
                    { letter: 'A', text: '3' },
                    { letter: 'B', text: '8' },
                    { letter: 'C', text: '5' },
                    { letter: 'D', text: '53' }
                ],
                knowledge: {
                    meaning: 'x+=3就是x=x+3，所以5+3=8。',
                    rule: 'x += n 等于 x = x + n。+=就是"加上再赋值"。',
                    error: '不要把+=当成字符串连接！+=是数学加法。',
                    example: '<code>x = 5</code><br><code>x += 3</code> → <code>x = 5 + 3 = 8</code>'
                }
            },
            {
                id: 17,
                category: '赋值运算符',
                categoryId: 3,
                type: '填空题',
                content: '执行以下代码后：<br><code>x = 10<br>x -= 3<br>x *= 2</code><br>x 的值是 ',
                answer: '14',
                knowledge: {
                    meaning: 'x=10→x=10-3=7→x=7×2=14。每一步都用最新的x值。',
                    rule: '复合赋值从左到右执行，每一步都用上一步的结果。',
                    error: '容易用初始值10算：10-3=7，10×2=20。记住每次都基于上一步的结果！',
                    example: '<code>x = 10</code><br><code>x -= 3</code> → <code>x = 7</code><br><code>x *= 2</code> → <code>x = 14</code>'
                }
            },
            {
                id: 18,
                category: '赋值运算符',
                categoryId: 3,
                type: '选择题',
                content: '表达式 <code>y = 5; y /= 2; y</code> 的结果是？',
                answer: 'C',
                options: [
                    { letter: 'A', text: '2' },
                    { letter: 'B', text: '2.0' },
                    { letter: 'C', text: '2.5' },
                    { letter: 'D', text: '报错' }
                ],
                knowledge: {
                    meaning: 'y/=2就是y=y/2，5除以2等于2.5。/总是返回浮点数。',
                    rule: 'y /= 2 = y = y / 2。注意/是普通除法，返回浮点数。',
                    error: '不要和//搞混！/返回小数，//才是整除。',
                    example: '<code>y = 5</code><br><code>y /= 2</code> → <code>y = 5 / 2 = 2.5</code>'
                }
            },
            {
                id: 19,
                category: '赋值运算符',
                categoryId: 3,
                type: '判断题',
                content: '<code>x = 10; x %= 3</code> 执行后，x 的值是 1。',
                answer: 'true',
                knowledge: {
                    meaning: 'x%=3就是x=x%3，10除以3余1，所以x=1。',
                    rule: 'x %= n = x = x % n。%是取余数。',
                    error: '不要把%当成除法！10%3是取余数，不是10除以3。',
                    example: '<code>x = 10</code><br><code>x %= 3</code> → <code>x = 10 % 3 = 1</code>'
                }
            },
            {
                id: 20,
                category: '赋值运算符',
                categoryId: 3,
                type: '选择题',
                content: '关于赋值运算符，以下说法正确的是？',
                answer: 'D',
                options: [
                    { letter: 'A', text: '<code>x += y</code> 等价于 <code>x =+ y</code>' },
                    { letter: 'B', text: '<code>x -= y</code> 等价于 <code>x = y - x</code>' },
                    { letter: 'C', text: '<code>x *= y</code> 等价于 <code>x = x * (y - 1)</code>' },
                    { letter: 'D', text: '<code>x **= y</code> 等价于 <code>x = x ** y</code>' }
                ],
                knowledge: {
                    meaning: 'x**=y就是x=x**y，即x的y次方。比如x=2,y=3，则x=2**3=8。',
                    rule: 'x op= y 等于 x = x op y，顺序是固定的。',
                    error: '+=是+和=挨着写的，不能写成=+！顺序很重要。',
                    example: '<code>x **= y</code> = <code>x = x ** y</code><br><code>x = 2, x **= 3</code> → <code>x = 8</code>'
                }
            },
            {
                id: 21,
                category: '成员运算符',
                categoryId: 4,
                type: '判断题',
                content: '<code>"a" in "apple"</code> 的结果是 <code>True</code>。',
                answer: 'true',
                knowledge: {
                    meaning: '"a"在"apple"里能找到，所以返回True。in就是"在...里"的意思。',
                    rule: 'x in y：检查x是否是y的子串/元素。找到了返回True。',
                    error: '注意大小写！"A" in "apple"是False，Python区分大小写。',
                    example: '<code>"a" in "apple"</code> → <code>True</code><br><code>"A" in "apple"</code> → <code>False</code>'
                }
            },
            {
                id: 22,
                category: '成员运算符',
                categoryId: 4,
                type: '选择题',
                content: '表达式 <code>3 in [1, 2, 3, 4]</code> 的结果是？',
                answer: 'A',
                options: [
                    { letter: 'A', text: 'True' },
                    { letter: 'B', text: 'False' },
                    { letter: 'C', text: '3' },
                    { letter: 'D', text: '报错' }
                ],
                knowledge: {
                    meaning: '3在列表[1,2,3,4]中能找到，所以返回True。',
                    rule: 'in检查元素是否在列表/元组/集合中，找到了就是True。',
                    error: '不要把in当成索引！3是元素，不是索引（索引是0,1,2,3）。',
                    example: '<code>3 in [1, 2, 3, 4]</code> → <code>True</code><br><code>0 in [1, 2, 3, 4]</code> → <code>False</code>'
                }
            },
            {
                id: 23,
                category: '成员运算符',
                categoryId: 4,
                type: '填空题',
                content: '<code>"key" not in {"name": "Tom", "key": "value"}</code> 的结果是 ',
                answer: 'False',
                knowledge: {
                    meaning: '字典里有"key"这个键，所以"key not in"是False。not in就是"不在...里"。',
                    rule: 'not in是in的反面。在里面返回False，不在里面返回True。',
                    error: '字典的成员是键不是值！"name" in dict检查的是键，不是"Tom"。',
                    example: '<code>"key" in {"name": "Tom"}</code> → <code>True</code><br><code>"Tom" in {"name": "Tom"}</code> → <code>False</code>'
                }
            },
            {
                id: 24,
                category: '成员运算符',
                categoryId: 4,
                type: '选择题',
                content: '以下哪个表达式的结果是 <code>True</code>？',
                answer: 'B',
                options: [
                    { letter: 'A', text: '<code>"3" in [1, 2, 3]</code>' },
                    { letter: 'B', text: '<code>3 in [1, 2, 3]</code>' },
                    { letter: 'C', text: '<code>"ab" in "a,b,c"</code>' },
                    { letter: 'D', text: '<code>None in [None, 1, 2]</code>' }
                ],
                knowledge: {
                    meaning: '3是整数，和列表里的3匹配。A错是因为"3"是字符串。C错是因为"ab"不是"a,b,c"的子串。',
                    rule: 'in检查类型和值都匹配。字符串"3"不等于整数3。',
                    error: '注意类型！"3"不等于3，"ab"不等于"a,b,c"（后者包含逗号）。',
                    example: '<code>"3" in [1, 2, 3]</code> → <code>False</code>（类型不同）<br><code>3 in [1, 2, 3]</code> → <code>True</code>'
                }
            },
            {
                id: 25,
                category: '成员运算符',
                categoryId: 4,
                type: '判断题',
                content: '<code>(1, 2) in [(1, 2), (3, 4)]</code> 的结果是 <code>True</code>。',
                answer: 'true',
                knowledge: {
                    meaning: '(1,2)作为整体是列表的第一个元素，所以能找到，返回True。',
                    rule: '元组可以整体作为列表的元素，in是完整匹配。',
                    error: '注意是整体匹配！(1,2)是查"元组(1,2)"在不在，不是查1或2在不在。',
                    example: '<code>(1, 2) in [(1, 2), (3, 4)]</code> → <code>True</code><br><code>1 in [(1, 2), (3, 4)]</code> → <code>False</code>'
                }
            },
            {
                id: 26,
                category: '综合挑战',
                categoryId: 5,
                type: '选择题',
                content: '表达式 <code>not 0</code> 的结果是？',
                answer: 'B',
                options: [
                    { letter: 'A', text: 'False' },
                    { letter: 'B', text: 'True' },
                    { letter: 'C', text: '0' },
                    { letter: 'D', text: '报错' }
                ],
                knowledge: {
                    meaning: '0在Python里是假，not假=真，所以not 0=True。',
                    rule: 'not真=假，not假=真。0等于假，非0等于真。',
                    error: '不要以为not 0=False！0是假，取反后是True。',
                    example: '<code>not 0</code> → <code>True</code><br><code>not 1</code> → <code>False</code>'
                }
            },
            {
                id: 27,
                category: '综合挑战',
                categoryId: 5,
                type: '填空题',
                content: '<code>10 // 3 + 10 % 3</code> 的结果是 ',
                answer: '4',
                knowledge: {
                    meaning: '先算//：10//3=3；再算%：10%3=1；最后算+：3+1=4。',
                    rule: '//和%优先级相同，比+高。从左到右算。',
                    error: '容易忘记优先级，应该先算整除和取模，再做加法。',
                    example: '<code>10 // 3 = 3</code><br><code>10 % 3 = 1</code><br><code>3 + 1 = 4</code>'
                }
            },
            {
                id: 28,
                category: '综合挑战',
                categoryId: 5,
                type: '判断题',
                content: '<code>"py" and "thon"</code> 的结果是 <code>"thon"</code>。',
                answer: 'true',
                knowledge: {
                    meaning: '"py"是真（非空字符串），所以返回第二个值"thon"。and/or返回的是实际值，不只是True/False！',
                    rule: 'a and b：a为真返回b，a为假返回a。',
                    error: '不要以为"py" and "thon"返回True！它返回的是"thon"这个字符串。',
                    example: '<code>"py" and "thon"</code> → <code>"thon"</code><br><code>"" and "thon"</code> → <code>""</code>'
                }
            },
            {
                id: 29,
                category: '综合挑战',
                categoryId: 5,
                type: '选择题',
                content: '执行 <code>x = 5; x *= 3 + 2</code> 后，x 的值是？',
                answer: 'C',
                options: [
                    { letter: 'A', text: '20' },
                    { letter: 'B', text: '21' },
                    { letter: 'C', text: '25' },
                    { letter: 'D', text: '30' }
                ],
                knowledge: {
                    meaning: '先算右边3+2=5，再算x*=5，即5*5=25。记住先算右边！',
                    rule: 'x *= a + b 等于 x = x * (a + b)，不是 x = x * a + b。',
                    error: '容易错把右边表达式拆开算，正确做法是先完整计算右侧。',
                    example: '<code>x = 5</code><br><code>x *= 3 + 2</code> = <code>x *= 5</code> = <code>x = 5 * 5 = 25</code>'
                }
            },
            {
                id: 30,
                category: '综合挑战',
                categoryId: 5,
                type: '填空题',
                content: '<code>"hello"[-1]</code> 的结果是 ',
                answer: 'o',
                knowledge: {
                    meaning: '"hello"的最后一个字符是"o"。-1就是倒数第一个。',
                    rule: '正数从0开始，负数从-1开始表示倒数位置。',
                    error: '不要以为-1是第一个！-1表示最后一个字符。',
                    example: '<code>"hello"[-1]</code> → <code>"o"</code><br><code>"hello"[-2]</code> → <code>"l"</code>'
                }
            }
        ];

// 单元对应的题目数据
        const unitQuestionsMap = {
            0: unit2Questions,
            1: unit1Questions
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
            ]
        };

// 成就元数据
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

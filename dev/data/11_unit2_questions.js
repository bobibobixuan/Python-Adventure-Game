const unit2Questions = [
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

// 第一单元：运算符题目

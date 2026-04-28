// 第三单元：循环入门题目数据
    const unit3Questions = [
            // ================= 第1关：for循环入门 (5道) =================
            {
                id: 201,
                category: 'for循环入门',
                categoryId: 0,
                type: '选择题',
                content: '执行代码：<br><code>for item in [1, 2, 3]:<br>&nbsp;&nbsp;&nbsp;&nbsp;print(item)</code><br>循环体会执行几次？',
                answer: 'C',
                options: [
                    { letter: 'A', text: '1 次' },
                    { letter: 'B', text: '2 次' },
                    { letter: 'C', text: '3 次' },
                    { letter: 'D', text: '4 次' }
                ],
                knowledge: {
                    meaning: '列表里有 3 个元素，for 会依次取出每个元素，所以循环体执行 3 次。',
                    rule: 'for ... in ... 的本质是“从可迭代对象里一个一个取值”。对象里有几个元素，就会跑几轮。',
                    error: '很多人会把“元素值 1、2、3”误看成“执行到 3 就停”，其实这里看的是元素个数。',
                    example: '<code>for x in [10, 20]:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print(x)</code><br>会执行 2 次。'
                }
            },
            {
                id: 202,
                category: 'for循环入门',
                categoryId: 0,
                type: '判断题',
                content: '在代码 <code>for letter in "hi":</code> 中，变量 <code>letter</code> 会先后取到 <code>h</code> 和 <code>i</code>。',
                answer: 'true',
                knowledge: {
                    meaning: '字符串也能被 for 逐个字符遍历，所以会先拿到 h，再拿到 i。',
                    rule: '列表、字符串、元组等都可以被 for 遍历。字符串遍历时，一次拿到一个字符。',
                    error: '不要以为 for 只能遍历数字列表，字符串同样可以一位一位地取。',
                    example: '<code>for ch in "cat":</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print(ch)</code><br>依次输出 c、a、t。'
                }
            },
            {
                id: 203,
                category: 'for循环入门',
                categoryId: 0,
                type: '填空题',
                content: '执行代码：<br><code>total = 0<br>for n in [1, 2, 3]:<br>&nbsp;&nbsp;&nbsp;&nbsp;total += n<br>print(total)</code><br>输出结果是 ',
                answer: '6',
                knowledge: {
                    meaning: 'total 从 0 开始，三轮分别加上 1、2、3，最后得到 6。',
                    rule: '循环里改变量时，要记住每一轮都基于“上一轮后的新值”继续算。',
                    error: '不要把每次都当成从 0 重新开始，这种题最容易漏掉“累计”的过程。',
                    example: '变化过程：<code>0 → 1 → 3 → 6</code>。'
                }
            },
            {
                id: 204,
                category: 'for循环入门',
                categoryId: 0,
                type: '选择题',
                content: '下面哪段代码是正确的 for 循环写法？',
                answer: 'B',
                options: [
                    { letter: 'A', text: '<code>for x in [1, 2, 3]</code>' },
                    { letter: 'B', text: '<code>for x in [1, 2, 3]:</code>' },
                    { letter: 'C', text: '<code>for (x in [1, 2, 3]):</code>' },
                    { letter: 'D', text: '<code>for x = [1, 2, 3]:</code>' }
                ],
                knowledge: {
                    meaning: '正确写法必须包含关键字 for、in、可迭代对象和结尾的冒号。',
                    rule: 'Python 的 for 语句格式是 <code>for 变量 in 对象:</code>。',
                    error: '最常见错误是漏掉冒号，或者把 in 错写成 =。',
                    example: '<code>for name in names:</code>'
                }
            },
            {
                id: 205,
                category: 'for循环入门',
                categoryId: 0,
                type: '填空题',
                content: '执行代码：<br><code>count = 0<br>for _ in ["a", "b", "c", "d"]:<br>&nbsp;&nbsp;&nbsp;&nbsp;count += 1<br>print(count)</code><br>输出结果是 ',
                answer: '4',
                knowledge: {
                    meaning: '列表里有 4 个元素，所以 count 会累加 4 次。',
                    rule: '变量名写成 <code>_</code> 时，通常表示“这个值我不关心，只关心循环会跑几次”。',
                    error: '不要被 a、b、c、d 的内容干扰，这题重点是轮数，不是元素本身。',
                    example: '<code>for _ in [10, 20]:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;count += 1</code><br>最终会加 2 次。'
                }
            },

            // ================= 第2关：range与计数 (5道) =================
            {
                id: 206,
                category: 'range与计数',
                categoryId: 1,
                type: '选择题',
                content: '<code>range(4)</code> 生成的数字序列是？',
                answer: 'A',
                options: [
                    { letter: 'A', text: '0, 1, 2, 3' },
                    { letter: 'B', text: '1, 2, 3, 4' },
                    { letter: 'C', text: '0, 1, 2, 3, 4' },
                    { letter: 'D', text: '4' }
                ],
                knowledge: {
                    meaning: 'range(4) 从 0 开始，到 4 之前结束，所以是 0、1、2、3。',
                    rule: '<code>range(stop)</code> 会生成从 0 到 <code>stop - 1</code> 的整数。',
                    error: '新手最容易把 4 也算进去，但 range 的右边界是“取不到”的。',
                    example: '<code>range(3)</code> 是 0、1、2，不包含 3。'
                }
            },
            {
                id: 207,
                category: 'range与计数',
                categoryId: 1,
                type: '填空题',
                content: '执行代码：<br><code>total = 0<br>for i in range(1, 5):<br>&nbsp;&nbsp;&nbsp;&nbsp;total += i<br>print(total)</code><br>输出结果是 ',
                answer: '10',
                knowledge: {
                    meaning: 'range(1, 5) 会得到 1、2、3、4，把它们加起来就是 10。',
                    rule: '<code>range(start, stop)</code> 包含 start，不包含 stop。',
                    error: '不要把 5 也加进去，停在 5 之前是这类题最关键的点。',
                    example: '<code>range(2, 5)</code> 是 2、3、4。'
                }
            },
            {
                id: 208,
                category: 'range与计数',
                categoryId: 1,
                type: '判断题',
                content: '<code>range(2, 6)</code> 生成的序列中包含数字 <code>6</code>。',
                answer: 'false',
                knowledge: {
                    meaning: 'range(2, 6) 的最后一个数是 5，不会包含 6。',
                    rule: 'range 总是“左边取到，右边取不到”。',
                    error: '这和数学里的区间概念不同，写代码时要强迫自己记住 stop 只是终点，不是成员。',
                    example: '<code>range(0, 2)</code> 只有 0 和 1。'
                }
            },
            {
                id: 209,
                category: 'range与计数',
                categoryId: 1,
                type: '选择题',
                content: '<code>range(0, 10, 2)</code> 生成的数字序列是？',
                answer: 'C',
                options: [
                    { letter: 'A', text: '1, 3, 5, 7, 9' },
                    { letter: 'B', text: '0, 2, 4, 6, 8, 10' },
                    { letter: 'C', text: '0, 2, 4, 6, 8' },
                    { letter: 'D', text: '2, 4, 6, 8, 10' }
                ],
                knowledge: {
                    meaning: '从 0 开始，每次加 2，到 10 之前停止，所以得到 0、2、4、6、8。',
                    rule: '<code>range(start, stop, step)</code> 中第三个参数表示“每次跳多少”。',
                    error: '不要把终点 10 算进去，也不要忘了它是从 0 起步。',
                    example: '<code>range(1, 6, 2)</code> 会得到 1、3、5。'
                }
            },
            {
                id: 210,
                category: 'range与计数',
                categoryId: 1,
                type: '填空题',
                content: '执行代码：<br><code>count = 0<br>for _ in range(3):<br>&nbsp;&nbsp;&nbsp;&nbsp;count += 1<br>print(count)</code><br>输出结果是 ',
                answer: '3',
                knowledge: {
                    meaning: 'range(3) 会让循环跑 3 轮，所以 count 最后变成 3。',
                    rule: '想让一段代码固定执行 N 次，用 <code>for _ in range(N):</code> 最直接。',
                    error: '很多人会误以为 range(3) 代表“从 1 到 3”，其实它只是让循环跑 3 次。',
                    example: '<code>for _ in range(5):</code> 表示执行 5 次。'
                }
            },

            // ================= 第3关：while循环 (5道) =================
            {
                id: 211,
                category: 'while循环',
                categoryId: 2,
                type: '判断题',
                content: '<code>while</code> 循环会在条件为 <code>True</code> 时重复执行代码块。',
                answer: 'true',
                knowledge: {
                    meaning: 'while 的核心就是“条件还成立，就继续做”。',
                    rule: 'while 每轮开始前都会重新判断一次条件。条件为真才进循环体。',
                    error: '不要把 while 想成“只判断一次”，它是每轮都重新判断。',
                    example: '<code>while x < 3:</code> 只要 x 还小于 3，就继续执行。'
                }
            },
            {
                id: 212,
                category: 'while循环',
                categoryId: 2,
                type: '填空题',
                content: '执行代码：<br><code>x = 1<br>count = 0<br>while x < 4:<br>&nbsp;&nbsp;&nbsp;&nbsp;count += 1<br>&nbsp;&nbsp;&nbsp;&nbsp;x += 1<br>print(count)</code><br>输出结果是 ',
                answer: '3',
                knowledge: {
                    meaning: 'x 会经历 1、2、3 三次满足条件，因此 count 累加 3 次。',
                    rule: '做 while 题时，最稳的方法是把“条件”和“变量变化”一起盯住。',
                    error: '容易只看 x 最后变成 4，就误判成执行 4 次。实际上 x=4 时已经不进循环了。',
                    example: '轮次是：x=1、2、3 进循环；x=4 停止。'
                }
            },
            {
                id: 213,
                category: 'while循环',
                categoryId: 2,
                type: '选择题',
                content: '下面哪种做法最能避免 <code>while</code> 循环一直停不下来？',
                answer: 'B',
                options: [
                    { letter: 'A', text: '把冒号删掉' },
                    { letter: 'B', text: '在循环里更新参与判断的变量' },
                    { letter: 'C', text: '把 while 改成 if' },
                    { letter: 'D', text: '让条件永远为 True' }
                ],
                knowledge: {
                    meaning: '如果循环里的变量一直不变，条件可能永远成立，程序就会一直重复。',
                    rule: 'while 常常需要在循环体里修改条件相关的变量，让程序有机会停下来。',
                    error: '新手最常见的 bug 就是忘了写 <code>x += 1</code> 这类更新语句。',
                    example: '<code>while x < 5:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;x += 1</code>'
                }
            },
            {
                id: 214,
                category: 'while循环',
                categoryId: 2,
                type: '填空题',
                content: '执行代码：<br><code>count = 0<br>while False:<br>&nbsp;&nbsp;&nbsp;&nbsp;count += 1<br>print(count)</code><br>输出结果是 ',
                answer: '0',
                knowledge: {
                    meaning: '条件一开始就是 False，所以循环体一次也不会执行。',
                    rule: 'while 会先判断条件，再决定要不要执行代码块。',
                    error: '不要想当然地进入循环。看到 while 先问自己：第一轮条件成立吗？',
                    example: '<code>while 3 &lt; 2:</code> 也是 0 次都不执行。'
                }
            },
            {
                id: 215,
                category: 'while循环',
                categoryId: 2,
                type: '选择题',
                content: '下面哪段代码是正确的 while 语句写法？',
                answer: 'D',
                options: [
                    { letter: 'A', text: '<code>while x &lt; 5</code>' },
                    { letter: 'B', text: '<code>while (x &lt; 5)</code>' },
                    { letter: 'C', text: '<code>while x = 5:</code>' },
                    { letter: 'D', text: '<code>while x &lt; 5:</code>' }
                ],
                knowledge: {
                    meaning: '正确写法和 if 一样，条件后要有冒号。',
                    rule: 'while 语句格式是 <code>while 条件:</code>。',
                    error: 'A 漏冒号，C 把判断写成赋值，都是初学者常见语法错误。',
                    example: '<code>while score &lt; 10:</code>'
                }
            },

            // ================= 第4关：break与continue (5道) =================
            {
                id: 216,
                category: 'break与continue',
                categoryId: 3,
                type: '选择题',
                content: '<code>break</code> 在循环中的作用是？',
                answer: 'A',
                options: [
                    { letter: 'A', text: '立刻结束当前循环' },
                    { letter: 'B', text: '跳过本轮，继续下一轮' },
                    { letter: 'C', text: '让循环从头开始' },
                    { letter: 'D', text: '让条件自动变成 False' }
                ],
                knowledge: {
                    meaning: 'break 的意思就是“断开”，一执行就直接跳出当前循环。',
                    rule: 'break 只负责结束它所在的那一层循环。',
                    error: '不要把 break 和 continue 混淆。continue 只是跳过本轮，不是结束整个循环。',
                    example: '<code>if x == 3:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;break</code>'
                }
            },
            {
                id: 217,
                category: 'break与continue',
                categoryId: 3,
                type: '判断题',
                content: '<code>continue</code> 会跳过本轮剩余代码，直接进入下一轮循环。',
                answer: 'true',
                knowledge: {
                    meaning: 'continue 的作用是“本轮别往下做了，去下一轮”。',
                    rule: 'continue 不会结束整个循环，只会结束当前这一轮。',
                    error: '有些人看到 continue 就以为循环结束了，其实它只是跳过当前这次。',
                    example: '<code>if x == 2:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;continue</code>'
                }
            },
            {
                id: 218,
                category: 'break与continue',
                categoryId: 3,
                type: '填空题',
                content: '执行代码：<br><code>count = 0<br>for i in [1, 2, 3, 4]:<br>&nbsp;&nbsp;&nbsp;&nbsp;if i == 3:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;break<br>&nbsp;&nbsp;&nbsp;&nbsp;count += 1<br>print(count)</code><br>输出结果是 ',
                answer: '2',
                knowledge: {
                    meaning: 'i 为 1、2 时都会让 count 加 1；到 3 时 break，后面不再执行。',
                    rule: 'break 出现后，当前循环直接结束，连本轮后面的代码也不再执行。',
                    error: '不要把 i=3 这一轮也算进去，因为在 count += 1 之前就已经 break 了。',
                    example: '执行到 3 时停止，所以只累计了前两轮。'
                }
            },
            {
                id: 219,
                category: 'break与continue',
                categoryId: 3,
                type: '选择题',
                content: '执行代码：<br><code>for i in [1, 2, 3, 4]:<br>&nbsp;&nbsp;&nbsp;&nbsp;if i == 2:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;continue<br>&nbsp;&nbsp;&nbsp;&nbsp;print(i)</code><br>会打印什么？',
                answer: 'B',
                options: [
                    { letter: 'A', text: '1 2 3 4' },
                    { letter: 'B', text: '1 3 4' },
                    { letter: 'C', text: '2 3 4' },
                    { letter: 'D', text: '只有 2' }
                ],
                knowledge: {
                    meaning: 'i=2 时被 continue 跳过，所以只会打印 1、3、4。',
                    rule: 'continue 会跳过当前轮剩余代码，所以这一轮里的 print 不会执行。',
                    error: '别把 continue 当成 break，它不会阻止后面的 3 和 4 继续执行。',
                    example: '跳过哪一轮，就少打印哪一个值。'
                }
            },
            {
                id: 220,
                category: 'break与continue',
                categoryId: 3,
                type: '判断题',
                content: '在嵌套循环里，<code>break</code> 默认只会跳出它所在的那一层循环。',
                answer: 'true',
                knowledge: {
                    meaning: 'break 只认识自己当前所在的循环，不会自动把外层也一起结束。',
                    rule: '嵌套循环里，break 只结束最近的一层循环。',
                    error: '这类题很容易把“跳出当前层”误看成“整个程序都停了”。',
                    example: '内层 break 结束内层，外层还会继续下一轮。'
                }
            },

            // ================= 第5关：循环嵌套 (5道) =================
            {
                id: 221,
                category: '循环嵌套',
                categoryId: 4,
                type: '选择题',
                content: '什么叫“循环嵌套”？',
                answer: 'D',
                options: [
                    { letter: 'A', text: '一个循环写两次' },
                    { letter: 'B', text: '把 while 改成 for' },
                    { letter: 'C', text: '循环里写 if' },
                    { letter: 'D', text: '在一个循环里面再放一个循环' }
                ],
                knowledge: {
                    meaning: '循环嵌套就是“外层每跑一轮，内层完整跑一遍”。',
                    rule: '嵌套结构中，内层循环属于外层循环体的一部分。',
                    error: '不要把“循环里有判断”误认为循环嵌套，嵌套要求里面还是循环。',
                    example: '<code>for row in rows:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;for col in cols:</code>'
                }
            },
            {
                id: 222,
                category: '循环嵌套',
                categoryId: 4,
                type: '填空题',
                content: '执行代码：<br><code>count = 0<br>for a in [1, 2]:<br>&nbsp;&nbsp;&nbsp;&nbsp;for b in ["x", "y", "z"]:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;count += 1<br>print(count)</code><br>输出结果是 ',
                answer: '6',
                knowledge: {
                    meaning: '外层有 2 轮，每一轮内层都跑 3 次，所以总共是 2 × 3 = 6。',
                    rule: '嵌套循环的总次数，常常可以理解成“外层轮数 × 内层轮数”。',
                    error: '不要只看到内层 3 次，也不要只看到外层 2 次，两层要一起算。',
                    example: '如果外层 4 次、内层 5 次，总共就是 20 次。'
                }
            },
            {
                id: 223,
                category: '循环嵌套',
                categoryId: 4,
                type: '判断题',
                content: '在嵌套循环中，外层循环每执行一轮，内层循环都会从头完整执行一遍。',
                answer: 'true',
                knowledge: {
                    meaning: '这正是嵌套循环最核心的运行方式。',
                    rule: '内层循环不是“接着上次继续”，而是外层每一轮都会重新从第一步开始。',
                    error: '新手常误以为内层跑完一次就结束了，其实它会随着外层重复多次。',
                    example: '外层 2 轮时，内层会“完整跑一遍”发生 2 次。'
                }
            },
            {
                id: 224,
                category: '循环嵌套',
                categoryId: 4,
                type: '选择题',
                content: '执行代码：<br><code>for x in [1, 2]:<br>&nbsp;&nbsp;&nbsp;&nbsp;for y in ["A", "B"]:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;print(x, y)</code><br>最先打印的两组内容是？',
                answer: 'A',
                options: [
                    { letter: 'A', text: '1 A，然后 1 B' },
                    { letter: 'B', text: '1 A，然后 2 A' },
                    { letter: 'C', text: '2 A，然后 2 B' },
                    { letter: 'D', text: '1 B，然后 2 B' }
                ],
                knowledge: {
                    meaning: 'x=1 时，内层 y 会完整跑 A、B，所以最先是 1 A、1 B。',
                    rule: '做嵌套题要固定住外层当前值，再把内层完整跑一遍。',
                    error: '很多人会太快切到 x=2，漏掉了 x=1 这一轮里还没跑完的内层。',
                    example: '顺序一般是：固定外层，扫完内层；再换下一个外层。'
                }
            },
            {
                id: 225,
                category: '循环嵌套',
                categoryId: 4,
                type: '填空题',
                content: '执行代码：<br><code>total = 0<br>for row in range(2):<br>&nbsp;&nbsp;&nbsp;&nbsp;for col in range(2):<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;total += 1<br>print(total)</code><br>输出结果是 ',
                answer: '4',
                knowledge: {
                    meaning: '外层 2 轮，内层每轮 2 次，所以 total 一共加了 4 次。',
                    rule: '看到两层都用 range(2)，就可以快速想到是 2 × 2。',
                    error: '不要把 range(2) 看成 2 和 2 两个值本身，重点是它代表“执行两轮”。',
                    example: '<code>range(3)</code> 搭配 <code>range(4)</code> 时，总次数是 12。'
                }
            },

            // ================= 第6关：综合挑战 (5道) =================
            {
                id: 226,
                category: '综合挑战',
                categoryId: 5,
                type: '填空题',
                content: '执行代码：<br><code>total = 0<br>for n in range(1, 6):<br>&nbsp;&nbsp;&nbsp;&nbsp;total += n<br>print(total)</code><br>输出结果是 ',
                answer: '15',
                knowledge: {
                    meaning: 'range(1, 6) 是 1、2、3、4、5，加起来等于 15。',
                    rule: '综合题依然要拆开做：先看序列，再看循环次数，最后看变量怎么累加。',
                    error: '不要被“综合挑战”吓住，本质仍然是前面学过的 range 和累加。',
                    example: '1+2+3+4+5 = 15。'
                }
            },
            {
                id: 227,
                category: '综合挑战',
                categoryId: 5,
                type: '选择题',
                content: '下面哪段代码会输出 0、1、2 这三个数字？',
                answer: 'B',
                options: [
                    { letter: 'A', text: '<code>for i in range(1, 3):<br>&nbsp;&nbsp;&nbsp;&nbsp;print(i)</code>' },
                    { letter: 'B', text: '<code>for i in range(3):<br>&nbsp;&nbsp;&nbsp;&nbsp;print(i)</code>' },
                    { letter: 'C', text: '<code>for i in range(1, 4):<br>&nbsp;&nbsp;&nbsp;&nbsp;print(i)</code>' },
                    { letter: 'D', text: '<code>for i in range(0, 2):<br>&nbsp;&nbsp;&nbsp;&nbsp;print(i)</code>' }
                ],
                knowledge: {
                    meaning: 'range(3) 刚好会从 0 打到 2。',
                    rule: '想打印 0 到 n-1，用 <code>range(n)</code> 最直接。',
                    error: 'A 和 D 都少一个数，C 则从 1 开始，不符合要求。',
                    example: '<code>range(5)</code> 对应 0、1、2、3、4。'
                }
            },
            {
                id: 228,
                category: '综合挑战',
                categoryId: 5,
                type: '判断题',
                content: '执行代码 <code>n = 3<br>while n &gt; 0:<br>&nbsp;&nbsp;&nbsp;&nbsp;n -= 1</code> 后，循环最终会停下来。',
                answer: 'true',
                knowledge: {
                    meaning: 'n 每轮都会减 1，所以会经历 3、2、1，最后变成 0，条件不再成立。',
                    rule: '只要循环里的更新让条件朝“终止方向”前进，while 就能正常结束。',
                    error: '很多人只盯着 while，不看里面的变化语句，结果判断不出会不会停。',
                    example: '当 n 变成 0 时，<code>n &gt; 0</code> 为假，循环结束。'
                }
            },
            {
                id: 229,
                category: '综合挑战',
                categoryId: 5,
                type: '填空题',
                content: '执行代码：<br><code>total = 0<br>for i in range(1, 6):<br>&nbsp;&nbsp;&nbsp;&nbsp;if i % 2 == 0:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;continue<br>&nbsp;&nbsp;&nbsp;&nbsp;total += i<br>print(total)</code><br>输出结果是 ',
                answer: '9',
                knowledge: {
                    meaning: '偶数 2 和 4 被 continue 跳过，只加上 1、3、5，所以得到 9。',
                    rule: 'continue 常用于“跳过不想处理的情况，只保留满足条件的值”。',
                    error: '如果没看出 continue 会跳过偶数，就容易把 1 到 5 全部加进去。',
                    example: '保留下来的数是 1、3、5，因此 1+3+5=9。'
                }
            },
            {
                id: 230,
                category: '综合挑战',
                categoryId: 5,
                type: '选择题',
                content: '如果你想让程序把“你好”打印 3 次，下面哪段代码最合适？',
                answer: 'D',
                options: [
                    { letter: 'A', text: '<code>if 3:<br>&nbsp;&nbsp;&nbsp;&nbsp;print("你好")</code>' },
                    { letter: 'B', text: '<code>while 3:<br>&nbsp;&nbsp;&nbsp;&nbsp;print("你好")</code>' },
                    { letter: 'C', text: '<code>for i in range(4):<br>&nbsp;&nbsp;&nbsp;&nbsp;print("你好")</code>' },
                    { letter: 'D', text: '<code>for i in range(3):<br>&nbsp;&nbsp;&nbsp;&nbsp;print("你好")</code>' }
                ],
                knowledge: {
                    meaning: 'range(3) 正好控制循环执行 3 次，是最标准的做法。',
                    rule: '固定次数重复任务，优先想到 <code>for ... in range(...)</code>。',
                    error: 'B 中 <code>while 3</code> 会一直为真，容易造成死循环；C 会打印 4 次。',
                    example: '<code>for _ in range(3):</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print("你好")</code>'
                }
            }
        ];
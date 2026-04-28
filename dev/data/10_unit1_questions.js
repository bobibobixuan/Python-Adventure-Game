const unit1Questions = [
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

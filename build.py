import os


def build_game():
    print("🚀 开始打包游戏文件...")

    with open('dev/index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    with open('dev/style.css', 'r', encoding='utf-8') as f:
        css_content = f"<style>\n{f.read()}\n</style>"
    with open('dev/data.js', 'r', encoding='utf-8') as f:
        data_content = f"<script>\n{f.read()}\n</script>"
    with open('dev/game.js', 'r', encoding='utf-8') as f:
        js_content = f"<script>\n{f.read()}\n</script>"

    final_html = html_content.replace('<!-- BUILD:STYLES -->', css_content)
    final_html = final_html.replace('<!-- BUILD:DATA -->', data_content)
    final_html = final_html.replace('<!-- BUILD:GAME -->', js_content)

    if not os.path.exists('dist'):
        os.makedirs('dist')

    output_path = 'dist/Python基础闯关_正式版.html'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(final_html)

    print(f"✅ 打包成功！文件已生成在：{output_path}")


if __name__ == '__main__':
    build_game()
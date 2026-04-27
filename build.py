from pathlib import Path
import subprocess
import sys


ROOT_DIR = Path(__file__).resolve().parent
DEV_DIR = ROOT_DIR / 'dev'
DIST_DIR = ROOT_DIR / 'dist'
OUTPUT_PATH = DIST_DIR / 'Python基础闯关_正式版.html'
DATA_VALIDATOR = ROOT_DIR / 'tools' / 'validate_data.py'
BUILD_PLACEHOLDERS = ['<!-- BUILD:STYLES -->', '<!-- BUILD:DATA -->', '<!-- BUILD:GAME -->']
SMOKE_CHECK_MARKERS = [
    'id="startScreen"',
    'id="questionContent"',
    'id="resultOverlay"',
    'id="adminScreen"',
    'const unitQuestionsMap =',
    'function init()'
]


def run_data_validation():
    if not DATA_VALIDATOR.exists():
        return

    result = subprocess.run(
        [sys.executable, str(DATA_VALIDATOR)],
        cwd=ROOT_DIR,
        check=False,
    )

    if result.returncode != 0:
        raise RuntimeError('题库校验未通过，构建已中止。')


def run_smoke_check(final_html):
    remaining_placeholders = [placeholder for placeholder in BUILD_PLACEHOLDERS if placeholder in final_html]
    missing_markers = [marker for marker in SMOKE_CHECK_MARKERS if marker not in final_html]

    if remaining_placeholders:
        raise ValueError(f'打包后仍存在未替换的占位符: {remaining_placeholders}')
    if '<style>' not in final_html:
        raise ValueError('打包结果缺少内联样式标签。')
    if final_html.count('<script>') < 2:
        raise ValueError('打包结果缺少内联脚本标签。')
    if missing_markers:
        raise ValueError(f'打包结果缺少关键标记: {missing_markers}')


def build_game():
    print("🚀 开始打包游戏文件...")
    run_data_validation()

    html_content = (DEV_DIR / 'index.html').read_text(encoding='utf-8')
    css_content = f"<style>\n{(DEV_DIR / 'style.css').read_text(encoding='utf-8')}\n</style>"
    data_content = f"<script>\n{(DEV_DIR / 'data.js').read_text(encoding='utf-8')}\n</script>"
    js_content = f"<script>\n{(DEV_DIR / 'game.js').read_text(encoding='utf-8')}\n</script>"

    final_html = html_content.replace('<!-- BUILD:STYLES -->', css_content)
    final_html = final_html.replace('<!-- BUILD:DATA -->', data_content)
    final_html = final_html.replace('<!-- BUILD:GAME -->', js_content)
    run_smoke_check(final_html)

    DIST_DIR.mkdir(exist_ok=True)

    OUTPUT_PATH.write_text(final_html, encoding='utf-8')

    print('🧪 Smoke check 通过')
    print(f"✅ 打包成功！文件已生成在：{OUTPUT_PATH.relative_to(ROOT_DIR)}")


if __name__ == '__main__':
    build_game()
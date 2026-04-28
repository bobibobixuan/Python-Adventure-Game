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


def resolve_bundle_source(file_name, directory_name):
    directory_path = DEV_DIR / directory_name
    if directory_path.exists():
        return directory_path
    return DEV_DIR / file_name


def load_bundle_content(source_path, suffix):
    if source_path.is_file():
        return source_path.read_text(encoding='utf-8')

    if source_path.is_dir():
        source_files = sorted(
            [path for path in source_path.rglob(f'*{suffix}') if path.is_file()],
            key=lambda path: path.relative_to(source_path).as_posix(),
        )
        if not source_files:
            raise ValueError(f'目录 {source_path.relative_to(ROOT_DIR)} 中未找到 {suffix} 文件。')

        return '\n\n'.join(path.read_text(encoding='utf-8') for path in source_files)

    raise FileNotFoundError(f'未找到可打包资源：{source_path.relative_to(ROOT_DIR)}')


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
    data_source = resolve_bundle_source('data.js', 'data')
    game_source = resolve_bundle_source('game.js', 'game')
    data_content = f"<script>\n{load_bundle_content(data_source, '.js')}\n</script>"
    js_content = f"<script>\n{load_bundle_content(game_source, '.js')}\n</script>"

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
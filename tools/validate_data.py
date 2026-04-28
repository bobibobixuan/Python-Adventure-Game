from __future__ import annotations

from collections import Counter
from pathlib import Path
import re
import sys


ROOT_DIR = Path(__file__).resolve().parents[1]
DEV_DIR = ROOT_DIR / 'dev'
DATA_FILE = DEV_DIR / 'data.js'
DATA_DIR = DEV_DIR / 'data'

QUESTION_BLOCK_PATTERN = re.compile(r"const\s+(unit\d+Questions)\s*=\s*\[(.*?)\n\s*\];", re.S)
QUESTION_MAP_PATTERN = re.compile(r"const\s+unitQuestionsMap\s*=\s*\{(.*?)\n\s*\};", re.S)
LEVELS_MAP_PATTERN = re.compile(r"const\s+unitLevelsMap\s*=\s*\{(.*?)\n\s*\};", re.S)
UNITS_PATTERN = re.compile(r"const\s+units\s*=\s*\[(.*?)\n\s*\];", re.S)
ACHIEVEMENTS_PATTERN = re.compile(r"const\s+achievementList\s*=\s*\[(.*?)\n\s*\];", re.S)
LEVEL_ARRAY_PATTERN = re.compile(r"(\d+)\s*:\s*\[(.*?)\]\s*,?", re.S)
QUESTION_META_PATTERN = re.compile(r"id:\s*(\d+),\s*category:\s*'[^']*',\s*categoryId:\s*(\d+)", re.S)
UNIT_NAME_PATTERN = re.compile(r"name:\s*'([^']+)'")
QUESTION_COUNT_PATTERN = re.compile(r"questions:\s*(\d+)")
ACHIEVEMENT_ID_PATTERN = re.compile(r"id:\s*'([^']+)'")


def load_data_source() -> tuple[str, str]:
    if DATA_DIR.exists():
        source_files = sorted(
            [path for path in DATA_DIR.rglob('*.js') if path.is_file()],
            key=lambda path: path.relative_to(DATA_DIR).as_posix(),
        )
        if not source_files:
            raise ValueError('dev/data 目录中未找到可校验的 .js 文件。')
        return '\n\n'.join(path.read_text(encoding='utf-8') for path in source_files), 'dev/data'

    if DATA_FILE.exists():
        return DATA_FILE.read_text(encoding='utf-8'), 'dev/data.js'

    raise FileNotFoundError('未找到题库源码，期望存在 dev/data.js 或 dev/data/*.js。')


def extract_block(pattern: re.Pattern[str], text: str, name: str) -> str:
    match = pattern.search(text)
    if not match:
        raise ValueError(f'无法在题库源码中定位 {name}。')
    return match.group(1)


def parse_units(text: str) -> list[str]:
    units_block = extract_block(UNITS_PATTERN, text, 'units')
    return UNIT_NAME_PATTERN.findall(units_block)


def parse_question_blocks(text: str) -> dict[str, list[tuple[int, int]]]:
    blocks: dict[str, list[tuple[int, int]]] = {}
    for variable_name, block in QUESTION_BLOCK_PATTERN.findall(text):
        pairs = [(int(question_id), int(category_id)) for question_id, category_id in QUESTION_META_PATTERN.findall(block)]
        blocks[variable_name] = pairs
    return blocks


def parse_unit_question_map(text: str) -> dict[int, str]:
    mapping_block = extract_block(QUESTION_MAP_PATTERN, text, 'unitQuestionsMap')
    return {int(unit_index): variable_name for unit_index, variable_name in re.findall(r"(\d+)\s*:\s*(\w+)", mapping_block)}


def parse_level_expectations(text: str) -> dict[int, list[int]]:
    level_block = extract_block(LEVELS_MAP_PATTERN, text, 'unitLevelsMap')
    result: dict[int, list[int]] = {}
    for unit_index, block in LEVEL_ARRAY_PATTERN.findall(level_block):
        result[int(unit_index)] = [int(count) for count in QUESTION_COUNT_PATTERN.findall(block)]
    return result


def parse_achievement_ids(text: str) -> list[str]:
    achievements_block = extract_block(ACHIEVEMENTS_PATTERN, text, 'achievementList')
    return ACHIEVEMENT_ID_PATTERN.findall(achievements_block)


def validate_data_file() -> tuple[list[str], list[str]]:
    text, source_name = load_data_source()
    errors: list[str] = []
    warnings: list[str] = []

    units = parse_units(text)
    question_blocks = parse_question_blocks(text)
    unit_question_map = parse_unit_question_map(text)
    level_expectations = parse_level_expectations(text)
    achievement_ids = parse_achievement_ids(text)

    expected_unit_indexes = set(range(len(units)))
    if set(unit_question_map) != expected_unit_indexes:
        errors.append(f'unitQuestionsMap 的键应覆盖 {sorted(expected_unit_indexes)}，当前为 {sorted(unit_question_map)}。')
    if set(level_expectations) != expected_unit_indexes:
        errors.append(f'unitLevelsMap 的键应覆盖 {sorted(expected_unit_indexes)}，当前为 {sorted(level_expectations)}。')

    all_question_ids: list[int] = []
    total_questions = 0

    for unit_index, variable_name in sorted(unit_question_map.items()):
        if variable_name not in question_blocks:
            errors.append(f'unitQuestionsMap[{unit_index}] 指向了不存在的变量 {variable_name}。')
            continue

        question_pairs = question_blocks[variable_name]
        expected_counts = level_expectations.get(unit_index, [])

        if not expected_counts:
            errors.append(f'unitLevelsMap[{unit_index}] 缺少关卡配置。')
            continue

        category_counts = Counter(category_id for _, category_id in question_pairs)
        unit_question_ids = [question_id for question_id, _ in question_pairs]
        all_question_ids.extend(unit_question_ids)
        total_questions += len(unit_question_ids)

        for _, category_id in question_pairs:
            if category_id < 0 or category_id >= len(expected_counts):
                errors.append(
                    f'{variable_name} 中存在越界的 categoryId={category_id}，该单元只有 {len(expected_counts)} 个关卡。'
                )

        for level_index, expected_count in enumerate(expected_counts):
            actual_count = category_counts.get(level_index, 0)
            if actual_count != expected_count:
                errors.append(
                    f'unit {unit_index} 第 {level_index + 1} 关题目数量不匹配：配置为 {expected_count}，实际为 {actual_count}。'
                )

        extra_levels = sorted(level_index for level_index in category_counts if level_index >= len(expected_counts))
        if extra_levels:
            warnings.append(f'{variable_name} 存在多余的关卡索引: {extra_levels}')

    duplicate_question_ids = [str(question_id) for question_id, count in Counter(all_question_ids).items() if count > 1]
    if duplicate_question_ids:
        errors.append(f'存在重复的题目 ID: {", ".join(sorted(duplicate_question_ids))}')

    duplicate_achievement_ids = [achievement_id for achievement_id, count in Counter(achievement_ids).items() if count > 1]
    if duplicate_achievement_ids:
        errors.append(f'存在重复的成就 ID: {", ".join(sorted(duplicate_achievement_ids))}')

    print(f'已检查 {len(units)} 个单元、{total_questions} 道题、{len(achievement_ids)} 个成就。来源：{source_name}')
    return errors, warnings


def main() -> int:
    try:
        errors, warnings = validate_data_file()
    except Exception as error:  # noqa: BLE001
        print(f'题库校验失败：{error}')
        return 1

    for warning in warnings:
        print(f'警告: {warning}')

    if errors:
        print('题库校验未通过：')
        for error in errors:
            print(f'- {error}')
        return 1

    print('题库校验通过。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
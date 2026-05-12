"""Extract questions from JS data files into Python dicts for seeding."""

import os
import re

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(PROJECT_ROOT, "dev", "data")


def extract_questions():
    js_files = [
        ("10_unit1_questions.js", "unit1Questions", 1),
        ("11_unit2_questions.js", "unit2Questions", 7),
        ("12_unit3_questions.js", "unit3Questions", 13),
    ]

    all_questions = []

    for filename, var_name, base_level_id in js_files:
        filepath = os.path.join(DATA_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        pattern = rf"const\s+{var_name}\s*=\s*\[([\s\S]*?)\];"
        match = re.search(pattern, content)
        if not match:
            print(f"Warning: Could not extract questions from {filename}")
            continue

        array_text = match.group(1)
        question_blocks = re.findall(r"\{([\s\S]*?)\}\s*(?:,\s*(?=\{)|\s*$)", array_text)

        for sort_order, block in enumerate(question_blocks):
            q_dict = _parse_question_block(block, base_level_id, sort_order)
            if q_dict:
                all_questions.append(q_dict)

    return all_questions


def _parse_question_block(block, base_level_id, sort_order):
    def extract(key):
        m = re.search(rf"{key}\s*:\s*(.+?)(?:,\s*\n|,\s*$|\n\s*\}}|$)", block, re.DOTALL)
        return m.group(1).strip().rstrip(",").strip() if m else ""

    def extract_str(key):
        val = extract(key)
        if val.startswith("'") and val.endswith("'"):
            return val[1:-1]
        if val.startswith('"') and val.endswith('"'):
            return val[1:-1]
        return val

    q_type = extract_str("type")

    category_id_str = extract("categoryId")
    try:
        local_level = int(category_id_str)
    except ValueError:
        local_level = 0
    level_id = base_level_id + local_level

    content = extract_str("content")
    answer = extract_str("answer")

    options = None
    if q_type == "选择题":
        options_match = re.search(r"options\s*:\s*\[([\s\S]*?)\]", block)
        if options_match:
            options_str = options_match.group(1)
            option_blocks = re.findall(r"\{([^}]+)\}", options_str)
            options = []
            for opt_block in option_blocks:
                letter_match = re.search(r"letter\s*:\s*'([^']+)'", opt_block)
                text_match = re.search(r"text\s*:\s*'([^']*)'", opt_block)
                if letter_match and text_match:
                    options.append({"letter": letter_match.group(1), "text": text_match.group(1)})

    knowledge = {}
    for k in ["meaning", "rule", "error", "example"]:
        m = re.search(rf"{k}\s*:\s*'([^']*)'", block)
        knowledge[k] = m.group(1) if m else ""

    if not q_type or not answer:
        return None

    return {
        "level_id": level_id,
        "type": q_type,
        "content": content,
        "options": options,
        "answer": answer,
        "knowledge_meaning": knowledge.get("meaning", ""),
        "knowledge_rule": knowledge.get("rule", ""),
        "knowledge_error": knowledge.get("error", ""),
        "knowledge_example": knowledge.get("example", ""),
        "sort_order": sort_order % 5,
    }


def generate_questions_py():
    questions = extract_questions()
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "questions.py")

    lines = ["# Auto-generated question data from dev/data/*.js files", "QUESTIONS = ["]
    for q in questions:
        lines.append("    {")
        for key, val in q.items():
            lines.append(f"        {key!r}: {val!r},")
        lines.append("    },")
    lines.append("]")
    lines.append("")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Generated {len(questions)} questions to {output_path}")


if __name__ == "__main__":
    generate_questions_py()

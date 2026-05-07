"""
text-[10px], text-[11px], text-[11.5px] → 큰 사이즈 치환.
같은 라인에 rounded-pill 이 있으면 스킵.
"""
import os
import re
from pathlib import Path

ROOT = Path('/Users/euijungner/aring-web')
SCAN_DIRS = ['app', 'components', 'lib']
EXTS = ('.tsx', '.jsx', '.ts', '.js')
SKIP_NAME_SUBSTR = ('.bak', '.backup')

REPLACEMENTS = [
    (re.compile(r'text-\[11\.5px\]'), 'text-[13px]'),
    (re.compile(r'text-\[11px\]'), 'text-[13px]'),
    (re.compile(r'text-\[10px\]'), 'text-[12px]'),
]

modified_files = []
total_lines_changed = 0
total_replacements = 0

for d in SCAN_DIRS:
    base = ROOT / d
    if not base.exists():
        continue
    for path in base.rglob('*'):
        if not path.is_file():
            continue
        if path.suffix not in EXTS:
            continue
        if any(s in path.name for s in SKIP_NAME_SUBSTR):
            continue
        with path.open('r', encoding='utf-8') as fh:
            lines = fh.readlines()
        original = list(lines)
        file_replacements = 0
        for i, line in enumerate(lines):
            if 'rounded-pill' in line:
                continue
            new_line = line
            for pat, repl in REPLACEMENTS:
                new_line, n = pat.subn(repl, new_line)
                file_replacements += n
            if new_line != line:
                lines[i] = new_line
                total_lines_changed += 1
        if lines != original:
            with path.open('w', encoding='utf-8') as fh:
                fh.writelines(lines)
            modified_files.append((str(path.relative_to(ROOT)), file_replacements))
            total_replacements += file_replacements

print(f'\n=== 수정된 파일 ({len(modified_files)}개) ===')
for f, n in modified_files:
    print(f'  {f}  ({n} replacements)')
print(f'\n총 라인 변경: {total_lines_changed}')
print(f'총 치환 횟수: {total_replacements}')

"""
패딩 클래스 3개 치환 + 잔존 검증.
"""
import os
from pathlib import Path

ROOT = Path('/Users/euijungner/aring-web')
SCAN_DIRS = ['app', 'components', 'lib']
EXTS = ('.tsx', '.jsx', '.ts', '.js')
SKIP_NAME_SUBSTR = ('.bak', '.backup')

REPLACEMENTS = [
    ('pb-28 lg:pb-12', 'pb-28 lg:pb-10'),
    ('px-5 lg:px-8 pt-2 pb-7 lg:pb-12', 'px-5 lg:px-8 pt-2 pb-5 lg:pb-10'),
    ('mx-5 lg:mx-8 relative overflow-hidden rounded-card bg-aring-grad-green p-5 lg:p-8',
     'mx-5 lg:mx-8 relative overflow-hidden rounded-card bg-aring-grad-green p-5 lg:p-7'),
]

VERIFY = ['pb-7 lg:pb-12', 'lg:p-8', 'lg:pb-12']

modified = []
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
            content = fh.read()
        original = content
        per_file = []
        for src, dst in REPLACEMENTS:
            count = content.count(src)
            if count > 0:
                content = content.replace(src, dst)
                per_file.append((src[:60] + ('…' if len(src) > 60 else ''), count))
        if content != original:
            with path.open('w', encoding='utf-8') as fh:
                fh.write(content)
            modified.append((str(path.relative_to(ROOT)), per_file))

print(f'\n=== 수정된 파일 ({len(modified)}개) ===')
for f, lst in modified:
    print(f'  {f}')
    for src, n in lst:
        print(f'      {n}x  {src!r}')

print('\n=== 잔존 검증 ===')
for needle in VERIFY:
    matches = []
    for d in SCAN_DIRS:
        base = ROOT / d
        if not base.exists():
            continue
        for path in base.rglob('*'):
            if not path.is_file() or path.suffix not in EXTS:
                continue
            if any(s in path.name for s in SKIP_NAME_SUBSTR):
                continue
            with path.open('r', encoding='utf-8') as fh:
                lines = fh.readlines()
            for i, line in enumerate(lines, 1):
                if needle in line:
                    matches.append((str(path.relative_to(ROOT)), i, line.rstrip()))
    status = '✓ 없음' if not matches else f'✗ 잔존 {len(matches)}건'
    print(f'  {needle!r}: {status}')
    for f, ln, txt in matches:
        print(f'      {f}:{ln}  {txt[:120]}')

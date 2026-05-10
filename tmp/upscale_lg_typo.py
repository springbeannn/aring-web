"""
PC(lg) 타이포 일괄 업스케일.
모바일 사이즈는 보존하고 lg: 변종만 키운다.

처리 순서: 구체적 페어 패턴 → 일반 단일 패턴.
일반 패턴은 negative lookahead로 이미 lg: 페어가 있는 경우 스킵.
"""
import re
from pathlib import Path

ROOT = Path('/Users/euijungner/aring-web')
SCAN_DIRS = ['app', 'components', 'lib']
EXTS = ('.tsx', '.jsx', '.ts', '.js')
SKIP_NAME = ('.bak', '.backup')

# 순서대로 적용: 페어 패턴 우선, 일반 패턴은 마지막
RULES = [
    # (regex, replacement, label)
    (r'text-\[22px\] lg:text-\[40px\]',
     'text-[22px] lg:text-[48px] lg:leading-[1.2]',
     '1. H1 22→48'),

    (r'text-\[16px\] lg:text-\[20px\]',
     'text-[16px] lg:text-[28px] lg:leading-[1.3]',
     '2. H2 16→28'),

    (r'text-\[26px\] lg:text-\[28px\]',
     'text-[26px] lg:text-[32px]',
     '3. logo 26→32'),

    (r'text-\[14px\] lg:text-\[15px\]',
     'text-[14px] lg:text-[18px] lg:font-bold',
     '6. card title 14→18'),

    (r'text-\[13px\] lg:text-\[14px\]',
     'text-[13px] lg:text-[15px] leading-[1.5]',
     '7. card desc 13→15'),

    (r'text-\[13px\] lg:text-\[13px\]',
     'text-[13px] lg:text-[15px] lg:leading-[1.6]',
     '8. subtext 13→15'),

    # 일반 단일: 이미 lg:text- 페어가 뒤따르면 스킵
    (r'(?<![\w\-:])text-\[13px\](?!\s+lg:text-)(?![\w\-])',
     'text-[13px] lg:text-[15px]',
     '4. nav/btn 13→15 (single)'),

    (r'(?<![\w\-:])text-\[12px\](?!\s+lg:text-)(?![\w\-])',
     'text-[12px] lg:text-[13px]',
     '9. caption 12→13 (single)'),
]

modified = []
for d in SCAN_DIRS:
    base = ROOT / d
    if not base.exists():
        continue
    for path in base.rglob('*'):
        if not path.is_file() or path.suffix not in EXTS:
            continue
        if any(s in path.name for s in SKIP_NAME):
            continue
        text = path.read_text(encoding='utf-8')
        original = text
        per_file = []
        for pat, repl, label in RULES:
            new_text, n = re.subn(pat, repl, text)
            if n > 0:
                text = new_text
                per_file.append((label, n))
        if text != original:
            path.write_text(text, encoding='utf-8')
            modified.append((str(path.relative_to(ROOT)), per_file))

print(f'\n=== 수정된 파일 ({len(modified)}개) ===')
total_per_label = {}
total = 0
for f, lst in modified:
    s = sum(n for _, n in lst)
    total += s
    print(f'  {f}  ({s}건)')
    for label, n in lst:
        total_per_label[label] = total_per_label.get(label, 0) + n

print(f'\n=== 총 치환 횟수: {total} ===')
print('--- 패턴별 합계 ---')
for label in sorted(total_per_label.keys()):
    print(f'  {total_per_label[label]:>4}x  {label}')

# 잔존 검증 — 중복 lg:text-[] 발생했는지 점검
print('\n=== 중복 lg:text-[] 검증 ===')
DUP = re.compile(r'lg:text-\[[0-9.]+px\] lg:text-\[[0-9.]+px\]')
issues = []
for d in SCAN_DIRS:
    base = ROOT / d
    if not base.exists():
        continue
    for path in base.rglob('*'):
        if not path.is_file() or path.suffix not in EXTS:
            continue
        if any(s in path.name for s in SKIP_NAME):
            continue
        for i, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
            if DUP.search(line):
                issues.append((str(path.relative_to(ROOT)), i, line.strip()[:140]))
print(f'  중복 발생: {len(issues)}건')
for f, ln, txt in issues[:10]:
    print(f'    {f}:{ln}  {txt}')

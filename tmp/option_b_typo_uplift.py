"""
옵션 B — 모바일 폰트 iOS 표준 정렬 (메타/라벨/뱃지 보존).

매핑:
- 페이지 H1:    22 → 24
- 섹션 H2:      17/18 → 20
- 카드 타이틀:  14 → 16
- 강조 본문:    15 → 16
- 본문 기본:    13 → 15

보존:
- 9, 10, 10.5, 11, 12, 12.5, 16px (메타/라벨/뱃지)

처리 순서:
- 페어 패턴 (text-[X] lg:text-[Y]) 우선 — lg가 모바일보다 작아지지 않게 함께 조정
- 단독 패턴 (lg 안 따라옴)은 negative lookahead로 안전 매칭
"""
import re
from pathlib import Path

ROOT = Path('/Users/euijungner/aring-web')
SCAN = ['app','components','lib']
EXTS = ('.tsx','.jsx','.ts','.js')
SKIP = ('.bak','.backup')

# (regex, replacement, label)
RULES = [
    # ─── 페어 패턴 ──────────────────────────────────────
    # 22px H1 — 모바일만 24로, lg는 보존
    (r'(?<![\w\-:])text-\[22px\] lg:text-\[22px\]',  'text-[24px] lg:text-[24px]', '22/22 → 24/24 (H1)'),
    (r'(?<![\w\-:])text-\[22px\] lg:text-\[26px\]',  'text-[24px] lg:text-[26px]', '22/26 → 24/26 (H1)'),
    (r'(?<![\w\-:])text-\[22px\] lg:text-\[28px\]',  'text-[24px] lg:text-[28px]', '22/28 → 24/28 (H1)'),
    (r'(?<![\w\-:])text-\[22px\] lg:text-\[48px\]',  'text-[24px] lg:text-[48px]', '22/48 → 24/48 (H1 hero)'),

    # 18px → 20
    (r'(?<![\w\-:])text-\[18px\] lg:text-\[22px\]',  'text-[20px] lg:text-[22px]', '18/22 → 20/22'),

    # 17px H2 → 20
    (r'(?<![\w\-:])text-\[17px\] lg:text-\[18px\]',  'text-[20px] lg:text-[20px]', '17/18 → 20/20 (H2)'),

    # 15px 강조 → 16
    (r'(?<![\w\-:])text-\[15px\] lg:text-\[16px\]',  'text-[16px] lg:text-[16px]', '15/16 → 16/16'),
    (r'(?<![\w\-:])text-\[15px\] lg:text-\[17px\]',  'text-[16px] lg:text-[17px]', '15/17 → 16/17'),

    # 14px 카드 타이틀/입력 → 16
    (r'(?<![\w\-:])text-\[14px\] lg:text-\[14px\]',  'text-[16px] lg:text-[16px]', '14/14 → 16/16'),
    (r'(?<![\w\-:])text-\[14px\] lg:text-\[15px\]',  'text-[16px] lg:text-[16px]', '14/15 → 16/16 (input)'),
    (r'(?<![\w\-:])text-\[14px\] lg:text-\[18px\]',  'text-[16px] lg:text-[18px]', '14/18 → 16/18 (card title)'),

    # 13px 본문 → 15
    (r'(?<![\w\-:])text-\[13px\] lg:text-\[14px\]',  'text-[15px] lg:text-[15px]', '13/14 → 15/15'),
    (r'(?<![\w\-:])text-\[13px\] lg:text-\[15px\]',  'text-[15px] lg:text-[15px]', '13/15 → 15/15 (body)'),

    # ─── 단독 (lg 없음 — negative lookahead) ─────────
    (r'(?<![\w\-:])text-\[22px\](?!\s+lg:text-)(?![\w\-])', 'text-[24px]', '22 단독 → 24'),
    (r'(?<![\w\-:])text-\[18px\](?!\s+lg:text-)(?![\w\-])', 'text-[20px]', '18 단독 → 20'),
    (r'(?<![\w\-:])text-\[17px\](?!\s+lg:text-)(?![\w\-])', 'text-[20px]', '17 단독 → 20'),
    (r'(?<![\w\-:])text-\[15px\](?!\s+lg:text-)(?![\w\-])', 'text-[16px]', '15 단독 → 16'),
    (r'(?<![\w\-:])text-\[14px\](?!\s+lg:text-)(?![\w\-])', 'text-[16px]', '14 단독 → 16'),
    (r'(?<![\w\-:])text-\[13px\](?!\s+lg:text-)(?![\w\-])', 'text-[15px]', '13 단독 → 15'),
]

modified = []
total_per_label = {}
total = 0

for d in SCAN:
    base = ROOT/d
    if not base.exists(): continue
    for p in base.rglob('*'):
        if not p.is_file() or p.suffix not in EXTS: continue
        if any(s in p.name for s in SKIP): continue
        text = p.read_text(encoding='utf-8')
        original = text
        per = []
        for pat, repl, label in RULES:
            new_text, n = re.subn(pat, repl, text)
            if n > 0:
                text = new_text
                per.append((label, n))
                total_per_label[label] = total_per_label.get(label, 0) + n
                total += n
        if text != original:
            p.write_text(text, encoding='utf-8')
            modified.append((str(p.relative_to(ROOT)), per))

print(f'\n=== 수정된 파일 ({len(modified)}개) ===')
for f, lst in modified:
    s = sum(n for _, n in lst)
    print(f'  {f}  ({s}건)')

print(f'\n=== 총 치환 횟수: {total} ===')
print('\n--- 패턴별 합계 ---')
for label in sorted(total_per_label.keys()):
    print(f'  {total_per_label[label]:>4}x  {label}')

# 잔존 검증
print('\n=== 잔존 검증 ===')
for sz in ['13px','14px','15px','17px','18px','22px']:
    pat = re.compile(rf'(?<![\w\-:])text-\[{sz}\](?![\w\-])')
    n = 0
    for d in SCAN:
        base = ROOT/d
        if not base.exists(): continue
        for p in base.rglob('*'):
            if not p.is_file() or p.suffix not in EXTS: continue
            if any(s in p.name for s in SKIP): continue
            n += len(pat.findall(p.read_text(encoding='utf-8')))
    print(f'  text-[{sz}] 잔존: {n}건  {"(보존된 lg 페어 변종 등)" if n>0 else ""}')

# 인버전 검증 — 모바일 > lg 경우 발견
print('\n=== 모바일 > lg 인버전 검증 ===')
INV = re.compile(r'text-\[([0-9.]+)px\] lg:text-\[([0-9.]+)px\]')
inversions = []
for d in SCAN:
    base = ROOT/d
    if not base.exists(): continue
    for p in base.rglob('*'):
        if not p.is_file() or p.suffix not in EXTS: continue
        if any(s in p.name for s in SKIP): continue
        for line_no, line in enumerate(p.read_text(encoding='utf-8').splitlines(), 1):
            for m in INV.finditer(line):
                mob, lg = float(m.group(1)), float(m.group(2))
                if mob > lg:
                    inversions.append((str(p.relative_to(ROOT)), line_no, m.group(0)))
print(f'  인버전(mobile > lg): {len(inversions)}건')
for f, ln, txt in inversions[:5]:
    print(f'    {f}:{ln}  {txt}')

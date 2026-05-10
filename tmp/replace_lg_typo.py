"""
모바일 text-[]에 lg:text-[] 추가하는 일괄 치환.
정확 일치 + 길이 내림차순 정렬로 substring overlap 안전 처리.
rounded-pill 동반 라인은 안전을 위해 추가 스킵.
"""
from pathlib import Path

ROOT = Path('/Users/euijungner/aring-web')
SCAN_DIRS = ['app', 'components', 'lib']
EXTS = ('.tsx', '.jsx', '.ts', '.js')
SKIP = ('.bak', '.backup')

# (검색, 치환) — 길이 desc로 자동 정렬
PAIRS = [
    # 그룹 1: Caption (12px → lg:13px)
    ('inline-flex items-center gap-1 text-[12px] transition text-aring-ink-500',
     'inline-flex items-center gap-1 text-[12px] lg:text-[13px] transition text-aring-ink-500'),
    ('mt-1.5 flex flex-col gap-1 text-[12px] text-aring-ink-500',
     'mt-1.5 flex flex-col gap-1 text-[12px] lg:text-[13px] text-aring-ink-500'),
    ('text-[12px] font-medium text-aring-ink-500',
     'text-[12px] lg:text-[13px] font-medium text-aring-ink-500'),
    ('text-[12px] text-aring-ink-500',
     'text-[12px] lg:text-[13px] text-aring-ink-500'),
    ('mt-1 text-[12px] text-aring-ink-500',
     'mt-1 text-[12px] lg:text-[13px] text-aring-ink-500'),
    ('mt-0.5 text-[12px] font-medium text-aring-ink-500',
     'mt-0.5 text-[12px] lg:text-[13px] font-medium text-aring-ink-500'),
    ('mt-0.5 text-[12px] text-aring-ink-400',
     'mt-0.5 text-[12px] lg:text-[13px] text-aring-ink-400'),
    ('text-[12px] font-semibold text-aring-ink-500 truncate',
     'text-[12px] lg:text-[13px] font-semibold text-aring-ink-500 truncate'),
    ('mt-1 text-[12px] text-aring-ink-400',
     'mt-1 text-[12px] lg:text-[13px] text-aring-ink-400'),
    ('text-[12px] text-aring-ink-400',
     'text-[12px] lg:text-[13px] text-aring-ink-400'),
    ('text-[12px] text-aring-ink-400 leading-relaxed',
     'text-[12px] lg:text-[13px] text-aring-ink-400 leading-relaxed'),
    ('text-[12px] font-semibold',
     'text-[12px] lg:text-[13px] font-semibold'),
    ('text-[12.5px] text-aring-ink-500 leading-[1.55]',
     'text-[12.5px] lg:text-[13px] text-aring-ink-500 leading-[1.55]'),

    # 그룹 2: Body-Small (13px → lg:14px)
    ('mt-0.5 text-[13px] font-bold text-aring-ink-900 truncate',
     'mt-0.5 text-[13px] lg:text-[14px] font-bold text-aring-ink-900 truncate'),
    ('mt-0.5 text-[13px] font-bold text-aring-ink-900 truncate leading-snug',
     'mt-0.5 text-[13px] lg:text-[14px] font-bold text-aring-ink-900 truncate leading-snug'),
    ('mt-0.5 text-[13px] text-aring-ink-500',
     'mt-0.5 text-[13px] lg:text-[14px] text-aring-ink-500'),
    ('mt-0.5 text-[13px] text-aring-ink-500 truncate',
     'mt-0.5 text-[13px] lg:text-[14px] text-aring-ink-500 truncate'),
    ('mt-1 text-[13px] text-aring-ink-500',
     'mt-1 text-[13px] lg:text-[14px] text-aring-ink-500'),
    ('mt-1 text-[13px] text-aring-ink-400',
     'mt-1 text-[13px] lg:text-[14px] text-aring-ink-400'),
    ('mt-1.5 text-[13px] text-aring-ink-400 leading-snug',
     'mt-1.5 text-[13px] lg:text-[14px] text-aring-ink-400 leading-snug'),
    ('mt-1.5 text-[13px] text-aring-ink-400',
     'mt-1.5 text-[13px] lg:text-[14px] text-aring-ink-400'),
    ('mt-2 text-[13px] text-aring-ink-500',
     'mt-2 text-[13px] lg:text-[14px] text-aring-ink-500'),
    ('mt-1.5 text-[13px] leading-relaxed text-aring-ink-900',
     'mt-1.5 text-[13px] lg:text-[14px] leading-relaxed text-aring-ink-900'),
    ('text-[13px] font-bold text-aring-ink-900 truncate',
     'text-[13px] lg:text-[14px] font-bold text-aring-ink-900 truncate'),
    ('text-[13px] font-bold text-aring-ink-900 leading-tight',
     'text-[13px] lg:text-[14px] font-bold text-aring-ink-900 leading-tight'),
    ('mt-0.5 text-[13px] font-bold text-aring-ink-900 leading-tight',
     'mt-0.5 text-[13px] lg:text-[14px] font-bold text-aring-ink-900 leading-tight'),
    ('text-[13px] font-medium text-aring-ink-500',
     'text-[13px] lg:text-[14px] font-medium text-aring-ink-500'),
    ('text-[13px] font-semibold text-aring-ink-500',
     'text-[13px] lg:text-[14px] font-semibold text-aring-ink-500'),
    ('text-[13px] font-semibold text-aring-ink-700',
     'text-[13px] lg:text-[14px] font-semibold text-aring-ink-700'),
    ('text-[13px] text-aring-ink-400',
     'text-[13px] lg:text-[14px] text-aring-ink-400'),
    ('mt-1 text-[13px] font-extrabold text-aring-ink-900',
     'mt-1 text-[13px] lg:text-[14px] font-extrabold text-aring-ink-900'),
    ('mt-4 text-[13px] text-aring-ink-500',
     'mt-4 text-[13px] lg:text-[14px] text-aring-ink-500'),
    ('mt-1.5 text-[13px] text-aring-ink-400',
     'mt-1.5 text-[13px] lg:text-[14px] text-aring-ink-400'),
    ('mt-2 text-[13px] font-bold text-aring-ink-400',
     'mt-2 text-[13px] lg:text-[14px] font-bold text-aring-ink-400'),
    ('text-aring-ink-600 text-[13px] font-medium',
     'text-aring-ink-600 text-[13px] lg:text-[14px] font-medium'),
    ('text-[13px] text-aring-ink-600 leading-snug',
     'text-[13px] lg:text-[14px] text-aring-ink-600 leading-snug'),

    # 그룹 3: Body (14px → lg:15px)
    ('text-[14px] font-extrabold text-aring-ink-900 truncate',
     'text-[14px] lg:text-[15px] font-extrabold text-aring-ink-900 truncate'),
    ('mt-0.5 text-[14px] font-extrabold text-aring-ink-900',
     'mt-0.5 text-[14px] lg:text-[15px] font-extrabold text-aring-ink-900'),
    ('text-[14px] font-extrabold text-aring-ink-900',
     'text-[14px] lg:text-[15px] font-extrabold text-aring-ink-900'),
    ('text-[14px] text-aring-ink-900',
     'text-[14px] lg:text-[15px] text-aring-ink-900'),
    ('block text-[13px] font-bold text-aring-ink-700',
     'block text-[13px] lg:text-[15px] font-bold text-aring-ink-700'),

    # 그룹 4: Title (17px / 22px)
    ('text-[17px] font-semibold text-aring-ink-900',
     'text-[17px] lg:text-[20px] font-semibold text-aring-ink-900'),
    ('text-[22px] font-black tracking-tight text-aring-green leading-none',
     'text-[22px] lg:text-[26px] font-black tracking-tight text-aring-green leading-none'),
    ('text-[22px] font-extrabold tracking-tight text-aring-ink-900',
     'text-[22px] lg:text-[26px] font-extrabold tracking-tight text-aring-ink-900'),
    ('text-[22px] font-extrabold tracking-tight leading-[1.3]',
     'text-[22px] lg:text-[26px] font-extrabold tracking-tight leading-[1.3]'),
    ('text-[22px] font-extrabold tracking-tight text-aring-ink-900 leading-[1.3]',
     'text-[22px] lg:text-[26px] font-extrabold tracking-tight text-aring-ink-900 leading-[1.3]'),
    ('text-[22px] font-black leading-none',
     'text-[22px] lg:text-[26px] font-black leading-none'),
]

# 길이 내림차순 정렬 (substring overlap 안전)
PAIRS_SORTED = sorted(PAIRS, key=lambda p: len(p[0]), reverse=True)

modified = []
total_replacements = 0

for d in SCAN_DIRS:
    base = ROOT / d
    if not base.exists():
        continue
    for path in base.rglob('*'):
        if not path.is_file() or path.suffix not in EXTS:
            continue
        if any(s in path.name for s in SKIP):
            continue
        c = path.read_text(encoding='utf-8')
        orig = c
        per_file = []
        for src, dst in PAIRS_SORTED:
            n = c.count(src)
            if n > 0:
                c = c.replace(src, dst)
                per_file.append((src[:55] + ('…' if len(src) > 55 else ''), n))
                total_replacements += n
        if c != orig:
            path.write_text(c, encoding='utf-8')
            modified.append((str(path.relative_to(ROOT)), per_file))

print(f'\n=== 수정된 파일 ({len(modified)}개) ===')
for f, lst in modified:
    total = sum(n for _, n in lst)
    print(f'  {f}  ({total}건)')

print(f'\n총 치환 횟수: {total_replacements}')

# rounded-pill 동반 라인이 잘못 수정되지 않았는지 확인
print('\n=== rounded-pill 라인 안전 검증 ===')
import re
issues = []
for d in SCAN_DIRS:
    base = ROOT / d
    if not base.exists():
        continue
    for path in base.rglob('*'):
        if not path.is_file() or path.suffix not in EXTS:
            continue
        if any(s in path.name for s in SKIP):
            continue
        for i, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
            if 'rounded-pill' in line and 'lg:text-[' in line:
                # rounded-pill 라인에 새로 추가된 lg:text-[]가 있는지
                # 단, 원래부터 있었던 lg:text-[]는 제외하기 어려우므로 일단 표시
                issues.append((str(path.relative_to(ROOT)), i, line.strip()[:140]))
print(f'  rounded-pill + lg:text-[] 동반 라인: {len(issues)}건')
for f, ln, txt in issues[:5]:
    print(f'    {f}:{ln}  {txt}')

"""
font-weight 정규화 — 4단계(400/600/700/900)로 통일.

치환 규칙:
- Tailwind: font-medium    → font-semibold
- Tailwind: font-extrabold → font-bold
- JS inline: fontWeight: 500 → 600 (숫자/문자열 모두)
- JS inline: fontWeight: 800 → 700
- CSS:      font-weight: 500 → 600
- CSS:      font-weight: 800 → 700

400/600/700/900 은 건드리지 않음.
"""
import re
from pathlib import Path

ROOT = Path('/Users/euijungner/aring-web')
SCAN_DIRS = ['app', 'components', 'lib']
EXTS = ('.tsx', '.jsx', '.ts', '.js', '.css', '.scss')
SKIP = ('.bak', '.backup')

# (정규식, 치환, 라벨)
PATTERNS = [
    # Tailwind class — 단어 경계 처리(다른 클래스 중간에 들어간 경우 방어)
    (re.compile(r'(?<![\w-])font-medium(?![\w-])'),    'font-semibold', 'tw:font-medium→font-semibold'),
    (re.compile(r'(?<![\w-])font-extrabold(?![\w-])'), 'font-bold',     'tw:font-extrabold→font-bold'),

    # JS/JSX inline fontWeight (숫자)
    (re.compile(r'(fontWeight\s*:\s*)500\b'), r'\g<1>600', 'js:fontWeight 500→600'),
    (re.compile(r'(fontWeight\s*:\s*)800\b'), r'\g<1>700', 'js:fontWeight 800→700'),

    # JS/JSX inline fontWeight (문자열 '500' 또는 "500")
    (re.compile(r"(fontWeight\s*:\s*)(['\"])500\2"), r"\g<1>\g<2>600\g<2>", "js:fontWeight '500'→'600'"),
    (re.compile(r"(fontWeight\s*:\s*)(['\"])800\2"), r"\g<1>\g<2>700\g<2>", "js:fontWeight '800'→'700'"),

    # CSS — font-weight: 500 / 800
    (re.compile(r'(font-weight\s*:\s*)500\b'), r'\g<1>600', 'css:font-weight 500→600'),
    (re.compile(r'(font-weight\s*:\s*)800\b'), r'\g<1>700', 'css:font-weight 800→700'),
]

results = []  # (path, [(label, count), ...])

for d in SCAN_DIRS:
    base = ROOT / d
    if not base.exists():
        continue
    for path in base.rglob('*'):
        if not path.is_file() or path.suffix not in EXTS:
            continue
        if any(s in path.name for s in SKIP):
            continue
        text = path.read_text(encoding='utf-8')
        original = text
        per = []
        for pat, repl, label in PATTERNS:
            text, n = pat.subn(repl, text)
            if n > 0:
                per.append((label, n))
        if text != original:
            path.write_text(text, encoding='utf-8')
            results.append((str(path.relative_to(ROOT)), per))

# 결과 보고
print(f'\n=== 수정된 파일 ({len(results)}개) ===\n')
total_per_label = {}
total_changes = 0
for fpath, per in results:
    file_total = sum(n for _, n in per)
    total_changes += file_total
    print(f'  {fpath}  ({file_total}건)')
    for label, n in per:
        print(f'      {n}x  {label}')
        total_per_label[label] = total_per_label.get(label, 0) + n

print(f'\n=== 총 치환 횟수: {total_changes} ===')
print('\n--- 패턴별 합계 ---')
for label in sorted(total_per_label.keys()):
    print(f'  {total_per_label[label]:>4}x  {label}')

# 잔존 검증 — 변경 후 500/800/font-medium/font-extrabold 가 남아있으면 표시
print('\n=== 잔존 검증 ===')
LEFTOVER = [
    re.compile(r'(?<![\w-])font-medium(?![\w-])'),
    re.compile(r'(?<![\w-])font-extrabold(?![\w-])'),
    re.compile(r'fontWeight\s*:\s*500\b'),
    re.compile(r'fontWeight\s*:\s*800\b'),
    re.compile(r"fontWeight\s*:\s*['\"]500['\"]"),
    re.compile(r"fontWeight\s*:\s*['\"]800['\"]"),
    re.compile(r'font-weight\s*:\s*500\b'),
    re.compile(r'font-weight\s*:\s*800\b'),
]
leftover_count = 0
for d in SCAN_DIRS:
    base = ROOT / d
    if not base.exists():
        continue
    for path in base.rglob('*'):
        if not path.is_file() or path.suffix not in EXTS:
            continue
        if any(s in path.name for s in SKIP):
            continue
        txt = path.read_text(encoding='utf-8')
        for pat in LEFTOVER:
            for m in pat.finditer(txt):
                leftover_count += 1
                print(f'  ✗ {path.relative_to(ROOT)} — {m.group(0)!r}')
                break
if leftover_count == 0:
    print('  ✓ 0건 — 모든 대상 패턴 치환 완료')

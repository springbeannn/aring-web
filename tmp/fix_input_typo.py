"""
input/textarea에 잘못 적용된 PC bold 클래스 되돌림.
text-[14px] lg:text-[18px] lg:font-bold → text-[14px] lg:text-[15px] lg:font-normal

input/textarea 컨텍스트 식별:
- 같은 라인에 placeholder= 있음 → 무조건 input/textarea
- 같은 라인에 inputBase 있음 → input 변수 정의
- 같은 라인에 <input 또는 <textarea 시작
- 앞쪽 ~6라인 안에 <input 또는 <textarea 시작 (멀티라인 JSX 대응)

input/textarea 컨텍스트 아닌 일반 텍스트(div/p/h)는 보존.
"""
import re
from pathlib import Path

ROOT = Path('/Users/euijungner/aring-web')
SCAN_DIRS = ['app', 'components']
EXTS = ('.tsx', '.jsx')
SKIP = ('.bak', '.backup')

PATTERN = 'text-[14px] lg:text-[18px] lg:font-bold'
REPLACE = 'text-[14px] lg:text-[15px] lg:font-normal'

LOOKBACK = 6  # 앞쪽 N라인 안에 <input/<textarea 있으면 input 컨텍스트로 판정

def is_input_context(lines: list[str], idx: int) -> bool:
    line = lines[idx]
    # 1) 같은 라인 시그널
    if 'placeholder=' in line:
        return True
    if 'inputBase' in line:
        return True
    if re.search(r'<\s*input\b', line) or re.search(r'<\s*textarea\b', line):
        return True
    # 2) 앞쪽 6라인 검사 — JSX 멀티라인 elem 대응
    start = max(0, idx - LOOKBACK)
    for i in range(start, idx):
        s = lines[i]
        if re.search(r'<\s*input\b', s) or re.search(r'<\s*textarea\b', s):
            # 그 사이에 닫는 > 가 없으면(=같은 elem 내부) 컨텍스트로 판정
            between = '\n'.join(lines[i:idx])
            # 단순 휴리스틱: 사이에 className= 가 있어 같은 elem 의 다른 prop 라인일 가능성 높음
            if 'className=' in between or 'placeholder=' in between or 'value=' in between or 'onChange=' in between:
                return True
    return False

modified = []
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
        if PATTERN not in text:
            continue
        lines = text.split('\n')
        changes = []
        for idx, line in enumerate(lines):
            if PATTERN in line and is_input_context(lines, idx):
                lines[idx] = line.replace(PATTERN, REPLACE)
                changes.append((idx + 1, line.strip()[:120]))
        if changes:
            path.write_text('\n'.join(lines), encoding='utf-8')
            modified.append((str(path.relative_to(ROOT)), changes))

print(f'\n=== 수정된 파일 ({len(modified)}개) ===')
total = 0
for f, ch in modified:
    print(f'  {f}  ({len(ch)}건)')
    for ln, txt in ch:
        print(f'      L{ln}: {txt}')
    total += len(ch)
print(f'\n총 치환: {total}건')

# 잔존 검증 — input/textarea 라인에 패턴이 남아있는지
print('\n=== input/textarea 잔존 검증 ===')
remain = []
for d in SCAN_DIRS:
    base = ROOT / d
    if not base.exists():
        continue
    for path in base.rglob('*'):
        if not path.is_file() or path.suffix not in EXTS:
            continue
        if any(s in path.name for s in SKIP):
            continue
        lines = path.read_text(encoding='utf-8').split('\n')
        for idx, line in enumerate(lines):
            if PATTERN in line and is_input_context(lines, idx):
                remain.append((str(path.relative_to(ROOT)), idx + 1, line.strip()[:140]))
print(f'  남은 input/textarea 패턴: {len(remain)}건')
for f, ln, txt in remain:
    print(f'    {f}:{ln}  {txt}')

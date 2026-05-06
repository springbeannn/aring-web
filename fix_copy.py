import os

files = [
    'app/signup/page.tsx',
    'app/signup/email/page.tsx',
    'app/login/page.tsx',
]

old = '버리기엔 아깝고, 다시 사기엔 아쉬운 귀걸이'
new = '버리기엔, 포기하기엔 너무 예쁜 귀걸이'

for path in files:
    if not os.path.exists(path):
        continue
    with open(path, 'r') as f:
        content = f.read()
    if old in content:
        content = content.replace(old, new)
        with open(path, 'w') as f:
            f.write(content)
        print(f'✅ {path} 교체 완료')
    else:
        print(f'⏭ {path} 해당 문구 없음')

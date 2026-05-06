import re

# ── login/page.tsx ──────────────────────────────────────
with open('app/login/page.tsx', 'r') as f:
    login = f.read()

# PC 좌측 패널: login_table1.jpg
# 모바일 배너:  login_table2.jpg
login = re.sub(
    r'(function LoginLeftPanel[\s\S]*?src=")[^"]*(")',
    r'\1/images/login_table1.jpg\2',
    login, count=1
)
login = re.sub(
    r'(function LoginMobileBanner[\s\S]*?src=")[^"]*(")',
    r'\1/images/login_table2.jpg\2',
    login, count=1
)

with open('app/login/page.tsx', 'w') as f:
    f.write(login)
print("✅ login/page.tsx 완료")

# ── signup/email/page.tsx ────────────────────────────────
with open('app/signup/email/page.tsx', 'r') as f:
    signup = f.read()

# PC 좌측 패널: login_table3.jpg
# 모바일 배너:  signup-pinktable.jpg
signup = re.sub(
    r'(function SignupLeftPanel[\s\S]*?src=")[^"]*(")',
    r'\1/images/login_table3.jpg\2',
    signup, count=1
)
signup = re.sub(
    r'(function SignupMobileBanner[\s\S]*?src=")[^"]*(")',
    r'\1/images/signup-pinktable.jpg\2',
    signup, count=1
)

with open('app/signup/email/page.tsx', 'w') as f:
    f.write(signup)
print("✅ signup/email/page.tsx 완료")

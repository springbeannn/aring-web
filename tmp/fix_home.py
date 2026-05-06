import re

path = "/Users/euijungner/aring-web/app/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. useRouter를 next/navigation import에 추가
if "useRouter" not in content:
    content = re.sub(
        r"(import\s*\{)([^}]*)(}\s*from\s*'next/navigation')",
        lambda m: m.group(1) + m.group(2).rstrip(", ") + ", useRouter" + m.group(3)
            if "useRouter" not in m.group(2) else m.group(0),
        content,
        count=1
    )
    print("Added useRouter to import")
else:
    print("useRouter already imported")

# 2. export default function 첫 줄 바로 뒤에 const router = useRouter() 추가
if "const router = useRouter()" not in content:
    content = re.sub(
        r"(export default function \w+[^{]*\{)",
        r"\1\n  const router = useRouter();",
        content,
        count=1
    )
    print("Added const router = useRouter()")
else:
    print("router already declared")

# 3. onClick 연결
old = "onClick={log('cta:find-by-photo')}"
new = "onClick={() => { log('cta:find-by-photo'); router.push('/search/photo'); }}"

if old in content:
    content = content.replace(old, new)
    print("Fixed onClick!")
else:
    print("WARNING: onClick pattern not found - check app/page.tsx manually")
    # 현재 파일에서 cta:find-by-photo 주변 찾기
    idx = content.find("cta:find-by-photo")
    if idx >= 0:
        print("Found at:", repr(content[idx-50:idx+80]))

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done!")
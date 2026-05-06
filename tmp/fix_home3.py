path = "/Users/euijungner/aring-web/app/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# 잘못 들어간 router 선언 제거 (HomePage 바깥에 있는 것들)
# 422번줄이 export default function HomePage() 이므로
# 그 이전에 있는 const router = useRouter() 는 제거
result = []
for i, line in enumerate(lines, 1):
    # HomePage 이전에 잘못 들어간 router 선언 제거
    if i < 422 and line.strip() == "const router = useRouter();":
        print(f"Removed stray router at line {i}")
        continue
    result.append(line)

# 이제 export default function HomePage() { 바로 다음 줄에 router 추가
final = []
inside_homepage = False
router_added = False
for line in result:
    final.append(line)
    if "export default function HomePage(" in line and not router_added:
        inside_homepage = True
    if inside_homepage and not router_added and line.strip() == "{":
        final.append("  const router = useRouter();\n")
        router_added = True
        print("Added router inside HomePage()")
        inside_homepage = False

# 혹시 { 가 같은 줄에 있는 경우 (export default function HomePage() {)
if not router_added:
    final2 = []
    for line in final:
        final2.append(line)
        if "export default function HomePage(" in line and "{" in line:
            final2.append("  const router = useRouter();\n")
            router_added = True
            print("Added router inside HomePage() (same line brace)")
    final = final2

with open(path, "w", encoding="utf-8") as f:
    f.writelines(final)

print("Done! router_added:", router_added)
path = "/Users/euijungner/aring-web/app/search/photo/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# matchSource 블록 교체
old_src = """      const matchSource = {
        style: analysisResult.style ?? [],
        material: analysisResult.material ?? [],
        shape: analysisResult.shape ?? [],
        detail: analysisResult.detail ?? [],
        mood: analysisResult.mood ?? [],
        keywords: [...(analysisResult.style ?? []), ...(analysisResult.material ?? []), ...(analysisResult.shape ?? [])],
      };
      const scored: MatchItem[] = (listings ?? [])
        .map((item: any) => {
          const target = {
            style: item.tags ?? [], material: item.tags ?? [], shape: item.tags ?? [],
            detail: item.tags ?? [], mood: item.tags ?? [], keywords: item.tags ?? [],
            description: item.description ?? '', title: item.title ?? '',
          };
          const result = calculateAringMatch(matchSource, target);"""

new_src = """      const matchSource = {
        shape: (analysisResult.shape ?? []).join(' '),
        color: (analysisResult.style ?? []).join(' '),
        material: (analysisResult.material ?? []).join(' '),
        detail: (analysisResult.detail ?? []).join(' '),
        brand: null,
        theme: (analysisResult.mood ?? []).join(' '),
      };
      const scored: MatchItem[] = (listings ?? [])
        .map((item: any) => {
          const tags: string[] = item.tags ?? [];
          const target = {
            shape: tags.join(' '),
            color: tags.join(' '),
            material: tags.join(' '),
            detail: [item.description ?? '', item.title ?? ''].join(' '),
            brand: item.brand ?? null,
            theme: tags.join(' '),
          };
          const result = calculateAringMatch(matchSource, target);"""

if old_src in content:
    content = content.replace(old_src, new_src)
    print("Fixed matchSource and target!")
else:
    print("ERROR: pattern not found")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done!")
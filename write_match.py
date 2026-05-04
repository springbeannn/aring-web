import pathlib
base = pathlib.Path.home() / 'aring-web'
p = base / 'app/match/[itemId]/page.tsx'
p.parent.mkdir(parents=True, exist_ok=True)
c = open(str(base / 'write_match_content.tsx')).read()
p.write_text(c)
print('done:', p)

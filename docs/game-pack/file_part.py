# Files one game-pack part: copies it into docs/game-pack/parts/ and cuts each "# Game N · Name icon"
# section into docs/game-pack/<id>/SPEC.md (id from the pitch table's "id · icon" row), with the part's
# shared intro on top; refreshes each game's README status. Usage (repo root): python docs/game-pack/file_part.py <upload.md> <NN-NAME.md> <date>
import os, re, sys, shutil
src, dest, date = sys.argv[1], sys.argv[2], sys.argv[3]
root = os.path.dirname(os.path.abspath(__file__))
shutil.copyfile(src, os.path.join(root, 'parts', dest))
part = open(src, encoding='utf-8').read()
head = part.split('\n---\n', 1)[0].strip()
starts = [m.start() for m in re.finditer(r'^# Game \d+ · ', part, re.M)] + [len(part)]
for a, b in zip(starts, starts[1:]):
    sec = part[a:b].rstrip()
    if sec.endswith('---'): sec = sec[:-3].rstrip()
    gid = re.search(r'id · icon \|\s*`([a-z0-9-]+)`', sec).group(1)
    title = sec.splitlines()[0].split(' · ', 1)[1]
    os.makedirs(os.path.join(root, gid), exist_ok=True)
    open(os.path.join(root, gid, 'SPEC.md'), 'w', encoding='utf-8', newline='\n').write(
        f"<!-- Cut from parts/{dest} (received {date}). The part file is the original;\n"
        f"     this copy is the one game's spec, with the part's shared intro on top. -->\n\n"
        + head + "\n\n---\n\n" + sec + "\n")
    rp = os.path.join(root, gid, 'README.md')
    r = open(rp, encoding='utf-8').read()
    r = re.sub(r'- \*\*Status:\*\* .*', f'- **Status:** spec received {date} (Part {dest[:2]}) — not started.', r)
    r = re.sub(r'- \*\*Spec:\*\* —', '- **Spec:** [SPEC.md](SPEC.md)', r)
    r = r.replace(f'part file `../parts/{dest[:2]}-*.md`', f'part file [`../parts/{dest}`](../parts/{dest})')
    open(rp, 'w', encoding='utf-8', newline='\n').write(r)
    print(gid, '←', title, len(sec.splitlines()), 'lines')
# the index row for this part: file link + received date (the table is prettier-padded, so match by cells)
ip = os.path.join(root, 'README.md')
lines = open(ip, encoding='utf-8').read().split('\n')
for i, l in enumerate(lines):
    cells = [c.strip() for c in l.split('|')]
    if len(cells) > 4 and cells[1] == dest[:2]:
        cells[2] = f'[parts/{dest}](parts/{dest})'
        cells[4] = f'received {date}'
        lines[i] = '| ' + ' | '.join(cells[1:5]) + ' |'
open(ip, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))
import subprocess
subprocess.run('pnpm exec prettier --write "docs/game-pack/**/*.md"', cwd=os.path.join(root, '..', '..'), shell=True, capture_output=True)

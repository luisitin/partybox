# Secret Hitler — review package

## M1 (2026-09-24): the Classic rules engine with plain screens

Screenshots and summary: https://claude.ai/artifact/F3smtvHYHN7agGHn5oMDCs (private to the owner).
Media: `reports/design/record-review/secret-hitler/shots/` (gitignored): all 16 phase scenes, TV
1920×1080, phones 320×568 and 393×852, hold-to-see presses, and the five themes for the vote and
game-over scenes. Made by loading reducer-built states into a real 7-player room through
`/api/dev/load-state` (main's `/preview` rejects camelCase fixture names).

1. 15 phases; every rule R1–R22 and D1–D11 has a test named after its id (81 tests).
2. Contract suite green for random / fast / idle / skipper bots at every pace; sim 4,800 games clean
   (5–10 players × random / idle / mixed / chaos × 200 seeds).
3. Views ≤ 4 KB at 10 players with UUID ids (TV 3.6 KB, phone 4.0 KB); state well under 96 KB.
4. The owner's four M1 rulings are built as NOTES.md describes.
5. Plain screens only: tokens `--pb-*`, stand-in SecretCard and FacePicker, no Record on the TV yet.

**Open questions:** settled on the hub (#decisions `997c4d`, see NOTES.md). They were: (1) President exiled during `vote`: the candidacy passes on. (2) No
Parliament Record on the M1 TV (layout), M2 draws it. (3) D7's "nominee exiled in `nominate`" is
an erratum. (4) Card rows: hold, slide and release to pick (one finger), or two-finger
hold-and-tap as written?

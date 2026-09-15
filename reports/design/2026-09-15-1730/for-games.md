# For the game authors — noticed during the round-2 design pass (2026-09-15)

Game-logic observations; the design session does not touch `games/*/server`.

1. **Wisecrack `answer`**: the TV counts answers ("1 / 12 answers in") but every chip stays `active`
   until the phase ends. Setting `status: 'submitted'` once a player's second answer is in (and maybe
   `waiting` after the first) would let the strip show progress per person, like Quick Poll does.
2. **Wisecrack `reveal`** lasts ~5 s with a 700 ms-per-item reveal: the second item is on screen for
   under 4 s before the next prompt. 8 s would let the room read the author line.
3. **Lightning `reveal`** shows every non-answer as `waiting`; a `submitted`/`active` split during the
   question phase would make the ✓ chips flip as people lock in (the TV only has the "n / m answered" count).

# Nightfall — review package (2026-09-24, branch `game/nightfall` @ 583abb46)

## In five lines

1. Hidden roles for 6–16: roles → night → dawn (→ hunter) → day → vote (→ runoff) → verdict (→ last
   words) → … → end. Wolves, seer, doctor; hunter and jester as options; village or mafia flavour.
2. Every night screen is the same for every role (same grid, same strip); what a role means hides
   under hold-to-see. Leak tests re-deal every role a viewer can't know and require the view to stay
   byte-identical — TV, every phone, and every bot decision.
3. The TV tells the story in paced steps (sunrise → news → the card turns; ballots land → spotlight
   → the card turns). The narrator (fable) speaks on the frame its words land (measured ±30 ms);
   phase cues play first, the voice ~0.36 s after.
4. Record-review: 0 dead spans and 0 hard cuts on the TV over whole games (p04, p12, p13b); phones
   only go still on the shell's results screen. Frame cost in isolation matches Lightning Round.
5. 78 unit tests, contract green, sim 200 random + 200 idle + 200 mixed green, `pnpm verify` green.

## Try it

- TV: `http://192.168.4.87:42400/tv` · phones: scan the TV's QR (6+ players; bots fill seats).
- Settings worth trying: **Special roles** (add Hunter and Jester), **Flavour** Town (mafia),
  **Town board** On (typed day), **Reveal roles** Off, **Narrator** (any voice / none), and a
  **Phone only** room (the phones show dawn, the verdict and the end).
- Hold the role card to see your role; at night everyone taps a face (tap yourself as a villager to
  see the private refusal).

## Media (local, gitignored) — `reports/design/record-review/nightfall/`

`p13b/video/tv.webm` + `se.webm` (a full game, TV + iPhone SE playing with its thumbs),
`p07-matrix/` (five themes, 200 % text, sideways), `p09-es/` (Spanish), `p10-phoneonly/`,
`p11-sixteen/` (16 players), `p08-touch/touch.txt` (168 touch-abuse trials: no selection, zoom or
page scroll anywhere).

## Decisions I made (NOTES.md has the list)

- The four role switches are one multiselect, **Special roles**: the manifest schema allows 12
  settings and the spec lists 15.
- Invalid night picks and a 4th post are refused on the phone itself (a game cannot send a private
  error today); the server ignores them too.
- Bots in the day act on beats the game draws (Ready 20–60 s in, posts across the day).
- Phase id `last-words` (the preview route needs lowercase); the input keeps the name `lastWords`.

## Open questions for the owner

1. **Dawn's voice on a busy host.** The spec says never to ask for a night line before dawn. On a
   loaded PC Kokoro sometimes needs 5–11 s for "Dee did not survive the night.", so the sunrise
   holds (up to 8 s) and, if still late, that line is shown but not spoken. Asking for that line for
   every living player during the night reveals nothing (it names everyone) and would make dawn's
   voice always on time. **Recommend: allow it.**
2. **Settings:** keep the one "Special roles" multiselect, or raise the manifest cap to 16 (a
   contract change) for four switches? **Recommend: keep the multiselect.**

## Not done yet (waiting on the platform, or next)

- Swap to Foundation's pieces when they reach main: ADR-050 layout (entry files, `manifest.es.json`,
  icon / howToPlay / presence / addedOn), Imposter's SecretCard + FacePicker, F4 presence (the town
  board's `auto` then follows remote-text), F6 `toSpeakable` + speech lab + render-clips.
- Speech-lab pass, recap read-through, phone chunk budget check (needs F1's check-bundle).
- More record-review passes: remote phone, idle room, drops mid-reveal, all five themes on phones.

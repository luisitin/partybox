# Blanks — card audit (2026-09-21, branch `card-audit`)

The owner's ask: more variety of white-card shapes (the decks were more than half "A ___"), an audit of
how every card is categorized (thing / doing / person / name), and a regrade of every card against the
prompts its kind serves — funny punchlines and crude serendipity up ("Who did 9/11?" + "Bush.";
"I wish I could hire ____ as a babysitter." + "Lindsay Clancy."), flat cards down. Dark cards were never
softened or removed; every id is kept.

Method: the decks were dumped with the kinds the fit model reads into them, split into batches of ~350
whites and ~500 blacks, and each batch was audited by hand against the deck's prompt list with a fixed
quota (at most 12 % tier 4, ~30 % tier 3, ~40 % tier 2, ~15 % tier 1; at least half the "A ___" cards
reshaped). The results were applied by script with guards: no text over 80 chars, no duplicate text
(within or across decks), no change to the ten cards the tests pin, a stable three-in-ten of the "A ___"
cards kept in their original shape so "A ___" stays one shape among many, and every `tags` word checked
against the prompts (a tag that matched no prompt, echoed the card's own words, or matched more than
twenty prompts was dropped). Reshaped prompts whose blank would read as another kind were reverted.

## Opening-word distribution (white cards)

| Deck  | Before                                          | After                                                   |
| ----- | ----------------------------------------------- | ------------------------------------------------------- |
| mild  | A 61.0 % · The 6.9 % · An 5.6 % · Getting 0.5 % | A 20.3 % · The 13.9 % · An 1.6 % · My 0.8 % · One 0.7 % |
| crude | A 55.0 % · An 5.2 % · The 4.7 % · Getting 1.4 % | A 17.2 % · The 14.0 % · Getting 1.7 % · Your 1.6 %      |
| wild  | A 56.6 % · An 4.8 % · The 3.6 % · Getting 2.9 % | A 18.9 % · The 13.8 % · Getting 3.1 % · An 1.7 %        |

No opening word is above 21 % of any deck now (target was 35 %). The rest of each deck spreads over
bare nouns and plurals ("Grandma's ashes.", "Anal beads, still under warranty."), gerunds ("Redeeming a
blowjob coupon."), possessives and proper names ("Father Mike's browser history.", "My dealer,
Sunshine."), full lines ("The gorilla learned sign language and confessed."), numbers ("One pube, stuck
in the smoke detector.") and one-to-three-word cards for the safe-word and nickname blanks ("Glory
hole.", "Monocled dick.").

Black cards (lighter, as asked): "The ____" openers went from 54.6 / 54.9 / 52.4 % to 51.9 / 51.8 / 48.0 %
(mild / crude / wild). Many more prompt reshapes were proposed but reverted by the guard because they
turned a blank into a question (a different card shape for `fill()`), or moved the blank's kind.

## Counts

| Deck  | Whites | Reshaped | `serves` set | Tier up | Tier down | Tagged | Added | Blacks reshaped | Black tier up / down | Black `slot` set |
| ----- | ------ | -------- | ------------ | ------- | --------- | ------ | ----- | --------------- | -------------------- | ---------------- |
| mild  | 2601   | 1153     | 404          | 129     | 1701      | 298    | 25    | 44              | 20 / 240             | 18               |
| crude | 2053   | 848      | 310          | 36      | 1499      | 222    | 30    | 37              | 39 / 330             | 25               |
| wild  | 2501   | 1009     | 334          | 70      | 1635      | 290    | 45    | 49              | 46 / 321             | 14               |

White tiers before → after (1 / 2 / 3 / 4):

- mild: 291 / 253 / 1075 / 957 → 457 / 1110 / 870 / 164
- crude: 56 / 250 / 1030 / 687 → 347 / 887 / 666 / 153
- wild: 202 / 129 / 1306 / 819 → 398 / 1090 / 789 / 224

Before the audit a third of every deck was "amazing" and over half "great", so the hand floors (five
great, three amazing) said nothing. Tier 4 is now the best 6–9 % of a deck, which is what the README
promised ("the best two hundred or so"); the floors test (`floors.test.ts`, 12 players × 15 rounds,
every pool) still holds. Black tiers (1 / 2 / 3): mild 361 / 394 / 504 → 423 / 490 / 346; crude
147 / 374 / 466 → 215 / 534 / 238; wild 106 / 422 / 394 → 227 / 458 / 237 — the tier-1 growth is mostly
near-duplicate prompt families ("X's basement held ____" × 13, "walk-in freezer" × 4, four bouncer
confiscations, nine group-chat prompts…), where the best copy keeps its tier and the twins go to the
back of the deck.

Two prompts were added to wild for the owner's examples: `wb925` "Who did 9/11?" and `wb926` "I wish I
could hire ____ as a babysitter." (slot person). 100 new white cards (`mw2585–2609`, `cw2043–2072`,
`ww2463–2507`) are mainstream named references for the thin `person+name` and short-`name` subcategories:
Bush, Lindsay Clancy, Casey Anthony, the Menendez brothers, Diddy, O.J., Dahmer, Bundy, Koresh, Cosby,
Weinstein, Ghislaine Maxwell, Madoff, Alex Murdaugh, Chris Watts, Matt Gaetz, Luigi Mangione, the Boeing
whistleblower, bin Laden, the Sacklers, Armie Hammer, Andrew Tate, Alex Jones, Chris Hansen, Gypsy Rose,
Pol Pot, Genghis Khan, the Manson family, Gacy, Matthew Perry, Carlos Danger, Jonestown Kool-Aid,
OceanGate, Harambe, Columbine, Flint tap water, MH370, Abu Ghraib… (wild); Stormy Daniels, Anthony Weiner,
George Santos, Hunter Biden's laptop, Hawk Tuah, Monica's blue dress, Jeffrey Toobin's Zoom, Rudy
Giuliani's hair dye, Michael Phelps' bong, Hulk Hogan's sex tape, El Chapo's tunnel… (crude); Travis
Kelce, Guy Fieri, Danny DeVito, Dwight Schrute, Martha Stewart, Dolly Parton, Keanu Reeves, The Rock,
Bill Nye, Weird Al, Jake from State Farm, Clippy, Grimace, Skibidi Toilet… (mild). Every one carries
`serves` and `tags`.

## Per-card affinities: `tags` (new)

The fit model had no per-card affinity, so one was added, small and explicit:

- `schema.ts`: white `tags?: string[]` (1–8 words or short phrases).
- `topics.ts`: `tagHit(blackText, tags)` — whole-word, any-case match of a tag in the prompt — and
  `pairBonus(black, white, tags?)` returns `TAG_HIT = 0.35` on a hit (above a tier step and the bot's
  noise, so a hand-picked pairing wins; the topic nudge stays 0.12).
- `content.ts`: `whiteTags(id)`; `bot.ts` passes it into `cardAppeal`; `deal.ts` `leadWithFit` sorts a
  hand by fit, then tag hit, then tier, so the phone's first screen leads with the card written for
  this prompt.
- 810 cards carry tags after pruning (e.g. "Bush." → `9/11`, `election`, `jumbotron`; "Lindsay
  Clancy." → `babysitter`, `nanny cam`; "Jeffrey Dahmer." → `freezer`, `leftovers`, `fridge`, `chef` — its `roommate` tag was pruned as
  too common).
- Tests: `topics.test.ts` covers `tagHit` and the bonus.

## fit.ts rule change

`PERSON_WORD` gained the occupation and public-figure heads the auditors kept meeting as misreads:
masseuse, acupuncturist, chiropractor, urologist, DJ, clerk, bouncer, janitor, mechanic, realtor,
accountant, pharmacist, lifeguard, magician, mime, mortician, undertaker, coroner, paramedic,
firefighter, sheriff, deputy, warden, inmate, cellmate, prisoner, mayor, governor, congressman,
reverend, minister, deacon, imam, guru, shaman, nanny, tutor, professor, dean, cheerleader,
quarterback, referee, umpire, goalie, contractor, exterminator, locksmith, chauffeur, butler, maid,
hitman, assassin, sniper, pirate, ninja, wizard, witch, vampire, zombie, handler; Nixon, Reagan,
Clinton, Bush, Cheney, Pelosi, Bernie, Kamala, Hillary, Zuckerberg, Bezos, Elvis, Diddy, Dahmer,
Bundy, Cosby, Weinstein, Madoff, Gacy, Manson, Koresh, Stalin, Napoleon, Lincoln, Gandhi, Rasputin.
The only pinned read that moved was "A zombie with one working hand." thing → person, which is the
better read. The golden was regenerated (`pnpm blanks-kinds-golden`; the generator now pins one thing
card in 14 instead of 25, because so many cards now carry explicit `serves` — which the golden skips —
that the "pins enough to matter" floor of 900 was no longer met).

Misreads the auditors fixed with `serves` instead of a rule (a rule would over-fire): full-sentence
cards with a person subject ("The dog saw everything.", "IT fixed the problem, and the person who
reported it."), "X, formerly Y." fragments, adjectival gerund openers ("Matching tattoos…",
"Wedding crashers"), sport nouns that look like gerunds ("Curling", "Squats"), and anthropomorphic
animal cards that answer "Who…?" in mild.

## The 30 best serendipity pairings (prompt + card)

1. Who did 9/11? — Bush.
2. I wish I could hire ____ as a babysitter. — Lindsay Clancy.
3. Who's running the bake sale now? — Casey Anthony.
4. Who's hosting Thanksgiving this year? — The Menendez brothers.
5. What did I use as lube in a pinch? — Diddy's thousand bottles of baby oil.
6. Who's driving the church van? — O.J.
7. Who's the new roommate? — Jeffrey Dahmer.
8. The app matched me with ____, and I never came back. — Ted Bundy.
9. Who's the new youth pastor? — David Koresh.
10. The morning after, I woke up next to ____. — Bill Cosby.
11. Who did Grandpa leave the boat to? — Alex Murdaugh.
12. Who's the father? — Chris Watts.
13. Who's behind the glory hole? — Chris Hansen.
14. The cult's welcome package includes ____. — Jonestown Kool-Aid.
15. The cruise ship's real itinerary was ____. — OceanGate.
16. What did I find at the bottom of the hot tub? — Matthew Perry.
17. What's the CIA's new interrogation technique? — Abu Ghraib.
18. The birthday clown's van held ____. — John Wayne Gacy.
19. Who's on the jumbotron? — Luigi Mangione.
20. What's the porn star's stage name? — Carlos Danger.
21. What did I use as lube in a pinch? — Honey, and then ants.
22. Napoleon compensated for his height with ____. — Napoleon's tiny cannon.
23. What did Stalin keep in his nightstand? — Stalin's dick pic collection.
24. My grandfather died doing what he loved: ____. — Autoerotic asphyxiation.
25. What did the priest bless by mistake? — Cum in the communion cup, again.
26. Who's my emergency contact? — Gerald the tapeworm.
27. My proctologist found ____. — Lincoln's log.
28. Who ruined the orgy? — The Jehovah's Witness who interrupted the orgy.
29. What's the hardest thing to explain to the paramedics? — The 69 that ended in a 911 call.
30. The morning after, I woke up next to ____. — Cheryl's husband. (crude: "Who's officiating the
    Vegas wedding?" — Elvis from the chapel.; mild: "What's the actual reason for the divorce?" —
    Thermostat wars.)

## Things I was unsure about

- **How much to reshape.** The auditors rewrote nearly every "A ___" card, more than the "good share"
  asked for; the apply step kept a stable three in ten of them in their original shape so "A ___" is
  still ~19 % of each deck. If the owner wants more of the original cadence back, the seed is in
  the apply script's hash (`h % 10 < 3`) and the originals are in git.
- **Tier 4 counts** landed at 6–9 % of each deck (164 / 153 / 224). The README's "two hundred or so"
  is met; if hands feel thin on 4s in a 12-player room, the floor swaps still find them (floors test
  green), but a second pass promoting the best tier 3s would be cheap.
- **Reverted prompt reshapes.** Roughly half the proposed black rewrites turned "The X was ruined by
  ____." into "What ruined the X?" (a question card with no blank). They were reverted because the
  blank count changed; if question-shaped prompts are wanted, those rewrites are in the agent
  outputs (not committed).
- **Cross-deck moves.** Several crude batches noted long runs of clean, mild-deck material
  (cw526–cw696, cw1039–cw1073) and wild has template runs of near-duplicates ("walk-in freezer" × 6,
  "made of people" motifs); they were graded down, not moved or removed (never delete). A dedupe /
  re-home pass is the obvious next step.
- **Two cards flagged, not changed:** ww678 "Bukkake at the Little League game." and ww2079
  "Consensual, mostly." sit near the deck's own minors / non-consent lines; left as they were.
- **Encoding.** The Read tool showed "séance" / "piñata" as mojibake to the auditors; the source files
  are clean UTF-8 and every applied text was checked for stray bytes. A few cards were rewritten with a
  proper "séance" where the auditor saw the artifact — harmless.
- **Tags are conservative.** Tags matching more than twenty prompts across the decks were pruned
  (roommate, wedding, hotel, retirement, group chat, cult…) so a tag stays a hand-picked pairing and
  never a second topic system; 18 cards lost all their tags that way.

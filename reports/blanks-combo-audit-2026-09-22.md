# Blanks combo audit, 2026-09-22 (WILD deck)

The owner: _"Audit the cards' ratings and combos that people get in Blanks. Ask yourself whether
'Grandma's cookies were laced with \___' and 'Harambe' is actually funny. We want kickers like 'What was
Hitler's favorite drink?' and 'Juice' because it makes a pun."_

## What was wrong

The game ranks an answer by how well it fits the blank's grammar and how good the card is **on its
own** (its tier). Nothing measured whether the _pair_ makes a joke, so tier-4 "shocking in any
blank" cards topped prompts where they are simply random — the cookies prompt's top eight were
Sister Agnes's vibrator, a cake topper of two men fighting, an Epstein flight log… And a
hand-picked pairing (a card's `tags`) only mattered if that card happened to be dealt: a verified
joke was in somebody's hand in **10 %** of rounds.

The cards most often judged _random_ where the model ranked them top-10 (kept as they are — the
owner's rule: never remove or soften a dark card; they simply no longer beat a verified joke):

- 571× — “Dick in a box, but the box is a Crock-Pot.” (tier 4)
- 415× — “Sister Agnes's vibrator, blessed.” (tier 4)
- 401× — “Cum in the communion cup, again.” (tier 4)
- 370× — “Anal lube, expired 2011.” (tier 4)
- 363× — “Minecraft's Auschwitz build, fully to scale.” (tier 4)
- 313× — “Missionary, but make it disappointing.” (tier 4)
- 293× — “Honey, and then ants.” (tier 4)
- 243× — “Elf on the Shelf, ICE informant.” (tier 4)
- 233× — “Survivor, but only one does.” (tier 4)
- 152× — “Sex with the lights on, for once.” (tier 4)

## How it was audited

1. `scripts/blanks-combo-dump.ts` — for each of the 924 prompts, the ten answers the bot's own yardstick
   ranks highest across the whole deck (noise off).
2. A workflow of 84 agents: one judge per batch of 40 prompts read those combos and searched all
   2,501 answers for the ones that make a real joke — a pun, a callback, dark serendipity, a perfect
   specific — or wrote the missing one; then **two independent skeptics** (a wordplay lens and a
   "would the room laugh" lens) scored every proposal, and only pairings **both** scored 4-5 of 5
   survive: **461 of 2226** proposals. A separate track invented new pun pairs in
   the owner's "Juice" style; **25** survived both skeptics (23 after removing two
   duplicate jokes).
3. Applied defensively: every tag must be a whole-word phrase of its prompt (the game's own
   `tagHit`), at most 8 per card; an answer an agent named is matched by its text, not its id.
   New cards were checked against **all three decks** — six collided with existing cards (the
   contract suite's leak check caught one: "Dry-cleaning Monica's blue dress." contains crude's
   "Monica's blue dress.") and were reworded keeping the joke.
4. Where a verified pair read badly under the fit model, the read was fixed at the right end: 20
   prompts read as "doing" blanks that plainly take things ("What finally ended the marriage?" →
   "O.J.'s glove.") now read as thing blanks (which still take doings); 16 answers carry the kind
   their verified prompt needs (3 existing — "Room temperature." is a thing too — and 13 new, e.g.
   "Gave them a half-life." is a doing).
5. `server/killers.ts`: when the round's prompt names a card still in the deck, one answerer (by the
   rng) is dealt it — traded for their weakest spare under every hand floor — and the fit floor never
   trades it away. The player still has to play it.

## Result (40 simulated 6-player wild games, 320 rounds, the same seeds before and after)

| per round                      | before     | after      |
| ------------------------------ | ---------- | ---------- |
| the prompt has a verified joke | 55.0 %     | 78.8 %     |
| the joke is in somebody's hand | **10.0 %** | **78.8 %** |
| it is played                   | 8.8 %      | 55.6 %     |
| it wins the round              | 7.5 %      | 47.8 %     |

Tests: `__tests__/killers.test.ts` (dealt once, sizes kept, never twice, untagged prompts untouched,
survives the round settling); all 107 Blanks tests and the contract suite green.

## The new pun prompts (23)

- **Where did the Hitler Youth go every summer?** → **Mein Kampf.** — Read aloud it sounds like 'my camp'. The joke works twice: summer camp for the kids, and the camps the book led to. It is Hitler's own book, so the answer is also a callback. (4/4)
- **What does a turkey say at a Nazi Thanksgiving?** → **Goebbels, Goebbels.** — A sound-alike pun: the turkey's 'gobble, gobble' turns into the name of the Nazi propaganda minister. It is short and loud, like 'Juice.'. (4/4)
- **What did the hangman say about Saddam Hussein?** → **Well hung.** — A crude double meaning: 'well hung' as a big penis against a clean hanging, and Saddam really was hanged on camera in 2006. The dick joke pays off because the event was real. (4/4)
- **JFK's last trip to Dallas was \____.** → **Mind-blowing.** — 'Mind-blowing' as a rave travel review against the Zapruder film, where the shot literally blew his head open. Everyone knows the event, so the praise lands as gore. (4/4)
- **What was Chris Brown's biggest hit?** → **Rihanna.** — Pun on 'hit': a chart hit for a singer, and the 2009 assault everyone remembers. The room reads it as a music question until the name lands. (5/5)
- **What's Vladimir Putin's favorite season?** → **Fall.** — Fall is autumn, and it is also what Putin's critics keep doing out of windows. It's a one-word kicker that works like Jew-ice. (4/4)
- **Where did Kurt Cobain end up after the shotgun?** → **Nirvana.** — Nirvana means the afterlife or enlightenment, and it's also his band. Mixing the suicide with the band name is the pun. (4/4)
- **At trial, Oscar Pistorius's defense didn't have \____.** → **A leg to stand on.** — The idiom means a weak case, and he is a double amputee who killed his girlfriend. Read aloud, the idiom is literally true. (4/4)
- **Why did Hitler finally kill himself?** → **He saw the gas bill.** — 'Gas bill' is a household utility bill and a nod to the gas chambers. It's the same Hitler-kicker family as the owner's 'Juice' example, with a new punchline. (4/4)
- **What's Bill Cosby's favorite part of any house?** → **The roofie.** — 'Roof' plus 'ie' turns the answer into the drug he was accused of using. The house-part setup makes it sound innocent until the last syllable. (4/4)
- **What did the stingray do to Steve Irwin?** → **Touched his heart.** — A sentimental idiom made literal: the barb went into his chest. It's the sweetest phrase in the deck for the darkest death. (4/4)
- **What do you call a nun in a wheelchair?** → **Virgin Mobile.** — PUN: the phone brand reads literally as a virgin (the nun) who is mobile (the wheelchair). It's crude about religion and disability at once, and it's a double pun, the same kind as Jew-ice. (4/4)
- **What workout did Jesus quit after one session?** → **CrossFit.** — PUN on the crucifixion: his one session on the cross killed him. The brand name becomes a death joke once you read it aloud. (4/4)
- **What does the necrophiliac do after a long shift at the morgue?** → **Cracks open a cold one.** — The bro phrase for opening a beer suddenly means a cold corpse. The friendly idiom turns into the sex crime, so it's crude and dark and still a clean double meaning. (4/4)
- **What did the guy say after losing his left arm and left leg?** → **I'm all right now.** — Double meaning: 'all right' as in 'fine' and 'all right' as in only his right side is left. It's the upbeat phrase that makes the amputation land as a punchline. (4/4)
- **What did the cannibal do after he dumped his girlfriend?** → **Wiped his ass.** — Pun on 'dumped': the prompt reads as a breakup, and the answer turns it into a bowel movement, meaning he ate her. It's crude, and the answer only works because of the one word in the prompt. (4/4)
- **What does a cannibal call a man in a wheelchair?** → **Meals on Wheels.** — The charity's name becomes literal: to a cannibal, a man in a wheelchair is a meal on wheels. It's dark about disability, and the pun is exact. (4/4)
- **What did the leper say to the hooker?** → **Keep the tip.** — Double meaning: the polite tipping phrase, and his penis tip falling off from leprosy. It's crude, about disease and sex together, and the answer is harmless until the prompt names a leper. (4/4)
- **How does Michael J. Fox take his martini?** → **Shaken, not stirred.** — A callback plus wordplay: Bond's famous order becomes literal because of a real person's Parkinson's tremor. It's the kind of dark serendipity the room likes about real people, and the pun makes it land. (4/4)
- **What does Chris Brown drink at parties?** → **Punch.** — The same setup as Hitler + Juice: a 'favorite drink' question where the drink names the crime. Punch is a party drink, and punching is what Chris Brown did to Rihanna in 2009. Read aloud, the one-word answer does the whole joke. (4/4)
- **Lorena Bobbitt's cooking show is called \____.** → **Chopped.** — Chopped is a real Food Network competition show. Lorena Bobbitt is famous for cutting off her husband's penis in 1993. The show title is also a short description of what she did. (5/4)
- **What did the OceanGate CEO promise the passengers?** → **We're gonna crush it.** — 'Crush it' is startup-CEO slang for doing great. The Titan submersible was crushed by deep-sea pressure in 2023, CEO on board. The confident catchphrase is literally how it ended, which only works because the prompt names OceanGate. (4/4)
- **What was Kobe Bryant's last shot?** → **An air ball.** — An air ball is a basketball shot that misses everything. Kobe died when his helicopter came down in 2020. A basketball term meaning his final shot describes the crash. (4/4)

## New answer cards (270), each with the prompt it was verified for

- “Our priest lost his faith after ____.” → **Finding Jesus on Grindr.** — Pun on 'finding Jesus': the most common 'conversion story' flipped.
- “My proctologist found ____.” → **Jimmy Hoffa.** — The classic never-found body, for every 'found ____' prompt.
- “What's the hardest thing to explain to the paramedics?” → **The gerbil, and the second gerbil sent in to find it.** — Calls back to the gerbil urban legend and makes it worse.
- “Someone brought ____ to the orgy and it got weird.” → **Mom, with orange slices.** — The most wholesome thing possible in the room is what makes it weird.
- “What's in my nightstand drawer?” → **My last one-night stand, folded neatly.** — Pun on nightstand/one-night stand, with a body twist.
- “I got an STD from ____.” → **The Clapper.** — Pun: 'the clap' is gonorrhea. Clap on, clap off.
- “My gynecologist gasped and said "____."” → **Hello, hello, hello.** — The echo joke, said out loud as a quote.
- “The porn parody of my life is called "____."” → **Schindler's Fist.** — A movie-title pun in the classic porn-parody style, with the deck's Holocaust edge.
- “What did the exorcist find?” → **A very possessive ex.** — Pun on possession.
- “What's the world's least popular sex toy?” → **The Dick Cheney: it shoots you in the face.** — Pun on 'Dick', with a callback to Cheney shooting a man in the face.
- “What's oozing out of the walls?” → **The Kool-Aid Man, who didn't make it.** — He bursts through walls. This time the wall won.
- “The hospice nurse's dark secret: ____.” → **Pillow talk.** — Pun: the pillow is how she talks to patients.
- “Why is there blood on the ceiling?” → **Period sex on a trampoline.** — The only innocent-ish answer, and it's worse.
- “What's the new tampon scent?” → **Mountain Dew Code Red.** — A real flavor name that doubles as period slang.
- “Grandpa's new nickname at the retirement home: "____."” → **Viagra Falls.** — Niagara/Viagra pun. The perfect old-man nickname.
- “What did I put in the neighbor's mailbox?” → **My junk, first-class.** — Pun: junk mail/junk. Like Dick in a Box, by post.
- “My will says I want to be buried with ____.” → **My second wife, alive, as is tradition.** — Calls back to the ancient burial custom, applied to a divorce.
- “What's the hot new drug at the office?” → **Molly from HR.** — Molly is MDMA and also that coworker in HR. An office pun in the 'Juice' style.
- “What's the bishop's guilty pleasure?” → **Taking the queen from behind, diagonally.** — Chess pun: a bishop only moves diagonally, and in the card it takes the queen from behind.
- “My uncle's basement is full of ____.” → **Josef Fritzl's family tree.** — The most famous basement in true crime. The uncle's basement becomes a callback.
- “What's my gynecologist's nickname for me?” → **Arby's.** — The crude 'roast beef' meme turned into a one-word nickname. The room gets it in a beat.
- “What's the worst thing to catch your grandpa doing?” → **Saluting during the Hitler documentary.** — Catching Grandpa at this reveals which side of the war he was on. A dark family reveal.
- “What's that sound coming from the attic?” → **Anne Frank's drum solo.** — The one thing the attic had to be was silent. A horribly exact Holocaust callback.
- “What's my drag name?” → **Anne Frankfurter.** — A classic drag-name pun (tuck the frankfurter) set on the darkest possible name.
- “What made the stripper cry?” → **Her dad, front row, tipping in singles.** — 'Daddy issues' made literal. A horribly specific reason to cry.
- “What did I wipe with?” → **The Shroud of Turin.** — Now the famous stain has an explanation. A blasphemous callback.
- “Tonight on the adult channel: ____.” → **Schindler's Lust.** — A porn-parody title pun on Schindler's List. The same dark-pun energy as 'Juice'.
- “My mom's Yelp review of the brothel mentions ____.” → **Dad, employee of the month.** — The twist: Dad works there, and he's good at it.
- “What did I find in the church donation box?” → **A baby with a note: "He's yours, Father.".** — Pun on 'Father': the priest's secret love child is dropped in the church box.
- “The massage parlor's "special" includes ____.” → **Robert Kraft's loyalty card.** — A callback to the billionaire massage-parlor sting. A regular's perk.
- “What ended the bachelorette party early?” → **The male stripper was the bride's dad.** — The exact nightmare reveal that ends a bachelorette party, and a dark one.
- “Doctors hate this one weird trick: ____.” → **Horse dewormer.** — The ivermectin craze: literally the one weird trick doctors hated.
- “What's inside the birthday cake?” → **The stripper, who ran out of air an hour ago.** — The pop-out-of-the-cake stripper, but dead: the obvious answer made dark.
- “What did the escort charge extra for?” → **Pretending to like your podcast.** — The real premium service is enduring the client; everyone knows a guy with a podcast.
- “What's the taxidermist's side hustle?” → **Mounting his ex-wife, both ways.** — Taxidermy mount vs sexual mount: the double meaning plus a dead ex.
- “What's Santa's kink?” → **Three hos at once.** — Ho ho ho: his catchphrase becomes his kink.
- “Step one: ____. Step two: ____. Step three: profit.” → **Collecting underpants.** — The prompt is the South Park Underpants Gnomes meme; this is their real step one.
- “The porn parody of "Titanic" features ____.” → **Drawing her like one of his French girls, with his dick.** — 'Draw me like one of your French girls': the quote everyone knows, made into porn.
- “The orgy was ruined by ____.” → **Recognizing your dad's balls.** — The most mood-killing possible orgy discovery, with a family horror.
- “I bought ____ at the 9/11 memorial gift shop.” → **Twin Towers Jenga, plane sold separately.** — Jenga towers fall when you knock them: the gift-shop toy and the "sold separately" add-on make the joke land.
- “Chernobyl's real cover-up: ____.” → **Concealer for the third eye.** — "Cover-up" read as makeup: the real Chernobyl cover-up is concealer on the mutation.
- “Biden's basement is full of ____.” → **Every hair he's ever sniffed, in jars.** — The hair-sniffing meme, turned into a creepy basement collection.
- “The last thing my proctologist said was "____."” → **Both my hands are on your shoulders.** — The classic proctologist punchline: then whose hand is that?
- “My dick pic was captioned "____."” → **Enlarged to show texture.** — The cereal-box disclaimer as a dick-pic caption admits the thing is tiny.
- “My grandfather died doing what he loved: ____.” → **Hiding in Argentina since 1945.** — It quietly reveals that Grandpa was a Nazi fugitive, and he died still hiding.
- “The Hindenburg was full of ____.” → **Gas the Nazis were saving for later.** — The Nazi zeppelin was full of gas: the Holocaust punchline is horribly, specifically right.
- “The Vatican's secret archive contains ____.” → **Jesus's foreskin, in a Ziploc.** — The Holy Prepuce is a real relic: the Vatican filing it in a sandwich bag is the right kind of wrong.
- “Putin's poison of choice: ____.” → **A seventh-floor window.** — Putin's critics keep falling out of windows: the room gets the real "poison" at once.
- “What did Marilyn Monroe do for JFK?” → **Giving him head before Oswald took it.** — "Head" as both sex act and the Dallas shot: a pun and a callback in one line.
- “The porn star's memoir is titled "____."” → **Eat, Pray, Gape.** — "Eat, Pray, Love" turned into porn: the memoir title pun.
- “The gimp mask smelled like ____.” → **Dad's cologne.** — The worst reveal a gimp mask can give: the gimp is your father.
- “The Titanic sank because of ____.” → **Just the tip.** — The tip of the iceberg meets the oldest sex line: a pun on why it sank.
- “I went to the glory hole and it led to ____.” → **Recognizing Dad's wedding ring through the hole.** — The worst possible thing that anonymous hole could lead to.
- “My tramp stamp says "____."” → **Exit only.** — A traffic sign right above the butt, so the anal joke lands at once.
- “The dildo factory's slogan is "____."” → **It's what's inside that counts.** — A wholesome saying that turns filthy in this blank.
- “What did Lincoln do at Ford's Theatre before the show?” → **Getting his mind blown.** — Blowjob and headshot in the same phrase.
- “The queen's coronation was ruined by ____.” → **Prince Andrew, visibly sweating.** — His 'I can't sweat' alibi and Epstein ties. Every royal fan gets it.
- “The last thing the astronaut jerked off to was ____.” → **Uranus.** — The classic planet pun, and it's the obvious answer in this blank.
- “The swingers' club has a strict policy on ____.” → **Double-dipping.** — Party-snack etiquette read as partner-swapping.
- “What's the worst thing about being a nun?” → **A husband who's been dead for two thousand years.** — Bride of Christ taken literally, as a widow.
- “Joe Rogan's newest guest talked about ____ for three hours.” → **The DMT machine elves.** — His signature topic. Every listener knows it.
- “The porn director yelled "cut" because of ____.” → **Lorena Bobbitt, on set.** — The most famous 'cut' in history, yelled by the director.
- “What did I do for a free taco?” → **Eating out, technically.** — Taco slang plus 'eating out' for a free meal: a real double pun.
- “With her dying breath, the stripper whispered "____."” → **No touching.** — A club rule as last words, which says who is standing over the body.
- “What's the strip club's two-for-one special?” → **Conjoined twins, one G-string.** — A literal two-for-one sharing one outfit.
- “What's the worst thing to find in a used sex toy?” → **Your mom's initials.** — The worst find isn't a germ. It's finding out who owned it.
- “What's the porn parody of "Frozen" called?” → **Let It Blow.** — A textbook porn-parody title pun on 'Let It Go'.
- “What's Trump's safe word?” → **Covfefe.** — His real nonsense word, and it works as a safe word.
- “Biden's vibrator is named ____.” → **Corn Pop.** — Biden's real story about a gangster called Corn Pop. It already sounds like a sex toy.
- “What did Hitler do in the bunker on Sundays?” → **Juggling his one ball.** — The 'Hitler has only got one ball' song everyone knows, as a sad Sunday hobby.
- “What ended the Roman orgy?” → **Vesuvius, erupting early.** — Eruption as premature ejaculation, and it's the real disaster that ended Pompeii.
- “What did they find in the Titanic wreck's honeymoon suite?” → **The door, with room for two.** — The endless Jack-and-Rose door argument, finally settled on the seabed.
- “What did Chernobyl do to my balls?” → **Gave them a half-life.** — Half-life, the radiation term, and his balls are now half alive.
- “My sex playlist opens with ____.” → **Limp Bizkit.** — A real band whose name is a limp-dick joke. Opening the sex playlist with it is a self-own the room gets instantly.
- “The condom's warning label mentions ____.” → **The Duggars.** — '19 Kids and Counting' is the family the room knows as never having used one. They make the perfect warning-label mascot.
- “Now streaming: the Bible porn parody, featuring ____.” → **The Second Coming.** — A scripture term that doubles as a cum joke. It is the perfect Bible-porn title pun, in the 'Juice' mould.
- “The sex tape's title is "____."” → **Saving Ryan's Privates.** — The canonical porn-parody title pun, which everyone recognises straight away.
- “The brothel's loyalty program rewards ____.” → **Charlie Sheen.** — The most famous repeat customer of paid sex. He is the platinum member everyone pictures.
- “The gloryhole's sign reads "____."” → **Hot-N-Ready.** — The Little Caesars slogan as a gloryhole sign. It is a pun that anyone who has bought a $5 pizza gets.
- “What's the porn parody of Thanksgiving called?” → **Plymouth Cock.** — Porn parody titles are puns: Plymouth Rock becomes Plymouth Cock. Instant Thanksgiving porn title.
- “The swingers' potluck featured ____.” → **Tossed salad, extra dressing.** — Potluck salad = anilingus slang; "extra dressing" makes it worse. Pun the swingers context unlocks.
- “What did Hitler put on his vision board?” → **An art school acceptance letter.** — The famous callback: Hitler was rejected from art school. The vision board shows the dream that would have saved the world.
- “The strip club's Sunday brunch includes ____.” → **Bottomless mimosas and bottomless waitresses.** — Brunch's "bottomless" means something else at a strip club. The double meaning is the joke.
- “What's in the church van's glove box?” → **The "Free Candy" sign.** — Callback to the creepy "free candy" van meme. The church van turns out to be that van.
- “What did the séance summon?” → **Epstein, confirming he didn't kill himself.** — The "Epstein didn't kill himself" meme finally gets its witness statement from the other side.
- “What's the one thing the cult won't do?” → **Issuing refunds.** — Cults do orgies, poison and compounds, but never give your money back. The Scientology/MLM gut-laugh.
- “The Titanic's last dinner was ____.” → **Iceberg lettuce.** — PUN: the ship's last course was the iceberg.
- “The trucker's CB handle is "____."” → **Piss Jug Pete.** — Truckers' pee-jug reputation turned into a perfect CB handle.
- “What did Stalin do on his day off?” → **Purging after brunch.** — Double meaning: a bulimic purge versus a political purge. Stalin purges even on his day off.
- “The porn parody of the Super Bowl features ____.” → **Tom Brady's deflated balls.** — The Deflategate callback, read as a porn pun about balls.
- “The cult's welcome package includes ____.” → **Matching Nikes and a comet schedule.** — Heaven's Gate: members died in matching Nikes, timed to the Hale-Bopp comet. For a welcome kit, it is the right callback.
- “What did Hitler do at parties?” → **Hotboxing the showers.** — Hotboxing is a party activity, and the gas chambers were disguised as showers. The same double meaning as the Juice pun.
- “What's the hospital's most-removed object?” → **Buzz Lightyear, to infinity and beyond.** — Buzz Lightyear is a famous real ER x-ray case, and 'to infinity and beyond' becomes a joke about depth.
- “What did the coroner write in the notes?” → **Skill issue.** — Gamer trash talk as the coroner's finding on a death is cruel and immediately funny.
- “The Epstein deposition mentions ____.” → **Prince Andrew, who medically cannot sweat.** — Prince Andrew's famous alibi from the BBC interview is the Epstein detail everyone quotes.
- “The dungeon's menu: ____, ____, and aftercare.” → **Chef's fist.** — A pun on 'chef's kiss' that belongs on a dungeon's menu.
- “My browser history is ____ and ____.” → **"Is it necrophilia if we're still married," searched twice.** — A real-sounding search query, and 'searched twice' is the punchline.
- “Grindr is ____ wearing ____.” → **A MAGA hat and nothing else.** — 'Grindr is Cheryl's husband wearing a MAGA hat and nothing else' is the closeted-Republican joke the room gets at once.
- “The sex shop's clearance bin holds ____ and ____.” → **Open-box Fleshlight, minor cosmetic damage.** — Best Buy returns wording on a used Fleshlight.
- “The dungeon tour: ____, ____, and ____.” → **Exit through the gift shop, ball gags half off.** — Every tour ends in a gift shop. The discount ball gags are the dungeon version.
- “The sex tape's three chapters: ____, ____, and ____.” → **End credits, longer than the sex.** — A chapter joke about how short it was, told as film structure.
- “The sex shop's employee of the month earned it with ____.” → **Quality-testing the returns, personally.** — The dedication that wins employee of the month, which the room reads as 'used the returned toys'.
- “The cult leader's sermon was about ____.” → **Hale-Bopp, and which Nikes to wear.** — Heaven's Gate: the comet and the matching Nikes are the details that make it land.
- “What did Epstein's chef prepare?” → **Hanger steak.** — Hanger steak, for the man who was found hanged. It is a food pun, like "Juice."
- “What did the séance dig up about Grandpa?” → **Grandpa's sudden 1945 move to Argentina.** — The date and the country say "Nazi on the run" without using the word.
- “What did the hotel maid walk in on?” → **David Carradine, hanging out in the closet.** — A callback (found dead in a Bangkok hotel closet) with a pun on "hanging".
- “My kink's origin story involves ____.” → **Disney's Robin Hood, the fox one.** — The Disney Robin Hood fox is the famous origin of furries, and people own up to it with a laugh.
- “What's on the sex tape's cutting room floor?” → **Lorena Bobbitt's director's cut.** — A "director's cut" by the most famous cutter: callback and pun on "cutting".
- “The cult's promise: ____ in exchange for ____.” → **Matching Nikes and a ride on the comet.** — Heaven's Gate callback: the cult's promise was literally matching Nikes and a spaceship behind a comet.
- “The nurse found ____ and, underneath it, ____.” → **Richard Gere's gerbil.** — The famous ER urban legend: the thing the nurse found underneath is the gerbil.
- “What did Hitler's art teacher write on his report card?” → **Needs to respect other kids' borders.** — Report-card language ('respect others' personal space') that is secretly about invading Poland.
- “Pompeii's brothel menu offered ____.” → **A position you can hold for two thousand years.** — Brothel menus list positions, and Pompeii's customers are still holding theirs, cast in ash.
- “The 9/11 memorial gift shop's bestseller: ____.” → **A mug that says "Jet fuel can't melt steel beams.".** — The truther meme the room knows, sold as merch at the memorial itself.
- “The Vikings' war cry was actually just ____.” → **"Ope, just gonna pillage past ya.".** — Minnesota Vikings plus the Scandinavian-Midwest 'Ope': polite Midwesterners raiding.
- “Michael Jackson's will left the chimp ____.” → **His spare nose.** — Callback to MJ's rhinoplasties, left in the will like a family heirloom.
- “Putin's newest window-cleaning service specializes in ____.” → **Squeegeeing oligarchs off the sidewalk.** — Window cleaning plus the defenestrated oligarchs: the crew cleans up from the bottom.
- “Alexa's final words were "____."” → **"Now playing 'Despacito.'".** — Callback to the 'This is so sad, Alexa play Despacito' meme, as her dying words.
- “Pearl Harbor's real motive: ____.” → **Getting lei'd.** — The Hawaiian lei pun as the invasion's real motive, a Jew-ice-style kicker.
- “The Black Death's silver lining: ____.” → **Finally affordable housing.** — Real history: the plague halved the population and crashed land prices. Callback plus the modern housing crisis.
- “The halftime show ended with ____.” → **Janet Jackson's other nipple.** — The most famous halftime-show ending of all, sequelized.
- “Bluey's darkest episode covers ____.” → **Bandit going to live on a farm upstate.** — The 'dog went to a farm' euphemism parents use for dead pets, applied to Bluey's dog dad.
- “The dentist charged extra for ____.” → **Oral.** — Oral care or oral sex: the one-word double meaning the room gets instantly.
- “Our gender reveal killed ____.” → **Most of California.** — Callback to the 2020 gender reveal that started the El Dorado wildfire, which killed a firefighter. Everyone knows gender reveals burn states down.
- “Grandma's will left the dog ____.” → **Grandpa's bones.** — Dogs get bones. Grandma's will leaves him Grandpa's, a pun on dog treats and remains.
- “The 4th of July casualty list included ____.” → **Three of Uncle Randy's fingers.** — Fireworks take fingers. Listing them as casualties by name is the dark, exact image.
- “What did the parrot say at the trial?” → **Polly wants a plea deal.** — A twist on "Polly want a cracker" in the courtroom. The parrot is the informant.
- “What did the roadie bury behind the venue?” → **The fourth drummer this year.** — Spinal Tap's drummers keep dying mysteriously. The roadie has a drummer plot behind every venue.
- “Thanksgiving dinner was served with a side of ____.” → **Dad's side piece.** — Pun on 'a side of'. Dad's mistress shows up as the side dish at the family dinner.
- “The Christmas miracle turned out to be ____.” → **Mary's alibi.** — Recasts the Immaculate Conception as a cover story for cheating.
- “The New Year's fireworks display was actually ____.” → **Uncle Randy's fingers, briefly airborne.** — The classic drunk-uncle fireworks injury, and part of the show.
- “Breaking: substitute teacher unmasked as ____.” → **Heisenberg.** — 'Breaking:' plus an unassuming teacher unmasked. That's Breaking Bad's Walter White.
- “The class pet's replacement was ____.” → **The teacher's pet, now in a cage.** — 'Teacher's pet' taken literally: the suck-up kid replaces the hamster.
- “The airline's in-flight meal contained ____.” → **The Uruguayan rugby team.** — The 1972 Andes crash, where survivors ate the passengers. The most famous in-flight meal ever.
- “The cruise ship's real itinerary was ____.” → **The Middle Passage, with a buffet.** — The ocean voyage the ship was really built for. Atrocity-grade dark, as the room likes it.
- “The hotel's "do not disturb" sign was hiding ____.” → **Whitney Houston's last bath.** — She died in a Beverly Hilton bathtub. A real celebrity hotel death behind the sign.
- “The hospital's night shift was known for ____.” → **Lucy Letby.** — The real neonatal nurse who killed babies on her shifts. Same energy as Lindsay Clancy for the babysitter prompt.
- “The surgeon left ____ inside me.” → **His left hand.** — 'The surgeon left his left hand inside me.' Wordplay on 'left'.
- “The clinic's waiting list got shorter after ____.” → **Dr. Kevorkian's house calls.** — The assisted-suicide doctor clears a waiting list the only way he knows.
- “Grandma's nursing home talent show ended with ____.” → **Sudden death, in overtime.** — The sports tiebreaker and literal nursing-home mortality.
- “What was in the piñata this year?” → **Rainbow fentanyl.** — The drug that looks like candy, from the Halloween-candy panic.
- “The jury acquitted him because of ____.” → **Affluenza.** — The real Ethan Couch defense: too rich to know better.
- “The prison riot started over ____.” → **Bill Cosby's pudding cup.** — Commissary pudding, Cosby's pudding pops, and the drugging all in one.
- “I resigned from the lab's ethics board over ____.” → **Rebooting Mengele's twin study.** — The canonical ethics-board nightmare, pitched as a sequel.
- “The experiment's control group ended up ____.” → **Pregnant, on the sugar pills.** — Control group vs. birth control: they got the placebo.
- “The home renovation found ____ in the chimney.” → **Santa, mummified since 1987.** — The obvious guest in a chimney, stuck for decades.
- “The new neighbors were hiding ____ in the shed.” → **Grandpa, who left Germany in a hurry in 1945.** — Nazis hiding abroad after the war. The new neighbors' shed is his Argentina.
- “The plumber pulled ____ out of the septic tank.” → **Jimmy Hoffa, finally.** — The most famous missing body, found in the least glamorous place.
- “What did the coroner find in the fashion designer's studio?” → **Buffalo Bill's unfinished skin suit.** — Silence of the Lambs: the killer who was a fashion designer.
- “Our family reunion's body count was blamed on ____.” → **Aunt Linda's potato salad, out since noon.** — Every family reunion has the sun-baked potato salad; it swaps murder for food poisoning.
- “Grandpa's basement held ____.” → **Grandma's first husband.** — Short and quietly awful: Grandpa's rival never really left the house.
- “The cult's harvest festival needed ____.” → **Nicolas Cage and a helmet full of bees.** — The Wicker Man remake's 'Not the bees!' scene is the cult-harvest meme.
- “We survived the camping trip and never spoke of ____.” → **Brokeback Mountain.** — The best-known camping trip nobody speaks of afterwards; instant room recognition.
- “What did the babysitter find in the attic?” → **The previous babysitter.** — The babysitter finds out what happened to the last one. A perfect horror twist.
- “What did the avalanche uncover?” → **The Uruguayan rugby team's packed lunch.** — The Andes crash survivors ate the dead after an avalanche; 'packed lunch' is the cruel twist.
- “The hitchhiker turned out to be ____.” → **Jesus, who then took the wheel.** — The Carrie Underwood line made literal: you pick up Jesus and lose the car.
- “The airline lost a passenger and found ____.” → **D.B. Cooper.** — The most famous passenger an airline ever lost; finding him is the payoff.
- “The video game's hidden level was ____.” → **Epstein Island, unlocked at 100% completion.** — The world's most notorious hidden location as the secret level. Crude, and right for the blank.
- “The speedrunner's secret was ____.” → **Premature ejaculation, any% world record.** — Speedrun lingo (any%, world record) applied to finishing way too fast.
- “The bartender's secret ingredient: ____.” → **Spirits. Mostly Grandpa.** — A pun on spirits as liquor and as ghosts: the secret ingredient is Grandpa's ashes.
- “The Roman games' halftime show was ____.” → **Janet Jackson's nipple, on a pike.** — The best-known halftime scandal, punished the Roman way.
- “The wedding was called off when they found ____.” → **Matching 23andMe results.** — The DNA test shows the bride and groom are related. An incest twist in three words.
- “The reception's chicken or fish was actually ____.” → **The bride's ex, in a white wine sauce.** — Catering menu phrasing plus wedding revenge: the ex got served, literally.
- “I got stuck at self-checkout because it wouldn't scan ____.” → **Grandpa's Auschwitz tattoo.** — Treats the camp number as a barcode that won't scan. Grim wordplay on 'scan'.
- “The trainer's before-and-after photos were really ____.” → **Auschwitz, arrival and liberation.** — The darkest possible weight-loss before-and-after. Horrible and specific.
- “The diet's only rule: eat nothing but ____.” → **Pussy, which counts as pescatarian.** — The old fish joke turned into a diet loophole. Pure crude wordplay.
- “The dragon's cave was full of ____.” → **Forty-year-old virgins, finally useful.** — Dragons demand virgins. The Steve Carell movie title makes it both a callback and a roast.
- “The wizard's potion was brewed from ____.” → **A wizard's sleeve.** — 'Wizard's sleeve' is crude slang for a loose vagina, so it plays both ways as a wizard's ingredient.
- “What did the mannequin turn out to be?” → **Aunt Carol, still doing the Mannequin Challenge from 2016.** — The 2016 meme meets a body nobody noticed for years. The room remembers the meme.
- “What did the genie ask for in return?” → **Rubbing his other lamp.** — Direct wordplay on rubbing the lamp: the genie wants a handjob.
- “The conspiracy was true: they were feeding us ____.” → **The chemicals that turn the frogs gay.** — Alex Jones's most famous rant, confirmed at last.
- “Area 51's containment breach released ____.” → **Every Naruto runner from 2019.** — The 2019 Storm Area 51 meme: the Naruto runners got in and are now the thing escaping.
- “The coffee's secret ingredient was ____.” → **Grandpa, finely ground.** — Coffee grounds and cremated Grandpa. Wordplay on 'ground'.
- “What did the aliens take instead of cattle?” → **Your mom, close enough.** — A 'yo mama is a cow' joke. The aliens made the substitution.
- “What did the waffle iron leave behind?” → **A blue waffle.** — Calls back the infamous 'blue waffle' internet STD hoax as something a waffle iron would leave behind.
- “The reality show's eliminated contestants ended up as ____.” → **Chum, for the Shark Tank finale.** — Shark Tank read literally. The losers become shark food.
- “Thanks for playing! Our losers will be sent to ____.” → **A nice farm upstate.** — The classic euphemism for putting down the family dog, used in a cheerful game-show sign-off.
- “The barn's hidden room held ____.” → **Josef Fritzl's second family.** — The most infamous hidden room in true crime.
- “What did the spy find in the embassy basement?” → **Most of Jamal Khashoggi.** — He was killed and dismembered inside a Saudi diplomatic building. 'Most of' is the horrible detail.
- “The moving truck's last stop was ____.” → **The lesbians' second date.** — The famous 'lesbians bring a U-Haul on the second date' joke. The moving truck is the punchline.
- “The retirement home's turnover was explained by ____.” → **Apple turnovers, heavy on the rat poison.** — Turnover the pastry versus turnover the death rate: the cafeteria dessert explains it.
- “The wagon train never arrived because of ____.” → **You have died of dysentery.** — The Oregon Trail death screen every millennial knows by heart.
- “Who's on the Epstein list this week?” → **Stephen Hawking, somehow.** — The 2024 unsealing meme: Hawking showed up in the Epstein docs, and 'somehow' lands the wheelchair joke.
- “Who taught the parrot that word?” → **Paula Deen, y'all.** — 'That word' means the n-word, and Paula Deen's deposition admitting she said it is the famous case; 'y'all' puts her voice on it.
- “Who's the father?” → **Nick Cannon, statistically.** — He has a dozen kids with several mothers, so 'statistically' makes it the odds-on answer on any paternity show.
- “Who won the wet T-shirt contest at the funeral?” → **The deceased. He drowned.** — 'Wet' pays off literally: the guest of honor has the wettest shirt at his own funeral.
- “Who did Grandpa leave the boat to?” → **Somali pirates. They're the captain now.** — The 'I'm the captain now' line from Captain Phillips, as a probate ruling.
- “Who's hosting Thanksgiving this year?” → **The Wampanoag. They brought blankets.** — Flips the smallpox-blanket story back on the pilgrims at the holiday it's about.
- “Who did the séance summon?” → **Epstein, who'd like to clarify some things.** — 'Epstein didn't kill himself.' The séance lets him say it himself.
- “Who's on the jumbotron?” → **A CEO and his head of HR, at Coldplay.** — The 2025 Coldplay kiss-cam scandal, the most famous jumbotron moment there is.
- “Who's been living in the attic?” → **Anne Frank. Keep your voice down.** — The most famous attic in history, told as a whispered warning.
- “Who did the dog choose?” → **Kristi Noem, unfortunately.** — She wrote in her own book about shooting her dog Cricket, so 'unfortunately' is the joke.
- “The doctor's second opinion was ____.” → **Also, you're ugly.** — The classic 'I want a second opinion.' 'OK, you're ugly too' joke as the diagnosis.
- “The flight went down because of ____.” → **Motherfucking snakes.** — Snakes on a Plane. The room shouts the Samuel L. Jackson line.
- “The airline's lost luggage turned out to be ____.” → **Amelia Earhart.** — The most famous thing aviation ever lost finally turns up at baggage claim.
- “The gym's missing members were traced to ____.” → **Lorena Bobbitt.** — Missing members, as in penises, traced to the woman famous for removing one.
- “What did the birthday boy find under the wrapping?” → **Gwyneth Paltrow's head.** — Se7en's 'What's in the box?!' as a birthday present.
- “What did the party's magician saw in half, actually?” → **Conjoined twins, as a favor.** — The magician sawing someone in half as surgery. Horribly helpful.
- “Disney's vault held ____.” → **Walt Disney's frozen head.** — The famous cryogenics legend. Of course it's in the vault.
- “The animatronic's new voice came from ____.” → **Stephen Hawking's voice box, secondhand.** — The most famous robot voice, reused for a robot. The room hears it instantly.
- “My therapist stopped taking notes when I mentioned ____.” → **His wife's safe word.** — The twist: the patient is sleeping with the therapist's wife. That's why he stopped writing.
- “Game night's missing player was found in ____.” → **Jumanji, still rolling for a five.** — The most famous player who went missing inside a board game.
- “What did the therapist do with the ones who didn't improve?” → **Referring them to Dr. Kevorkian.** — A referral as a quiet death sentence, sent to the famous suicide doctor.
- “What did the dungeon master bury in the yard?” → **The last party, all five of them.** — In D&D a 'party' is the group of players. He buried the previous group.
- “What did the Disney character's costume hide?” → **Xi Jinping.** — The Winnie-the-Pooh = Xi meme, so the one inside the costume is Xi.
- “The palace dungeon held ____.” → **Princess Diana's brake lines.** — The most famous royal conspiracy theory, stored in the palace basement.
- “The Olympic village's incident was ____.” → **Five interlocking cock rings.** — The Olympic rings become cock rings. It's a visual pun on the logo.
- “The eco-commune's harvest festival needed ____.” → **The boyfriend, sewn into a bear, on fire.** — This is Midsommar's commune festival finale. Anyone who saw it screams.
- “What did the royal autopsy find?” → **Prince Andrew, not sweating.** — This calls back to his famous 'I can't sweat' alibi, found at the royal autopsy.
- “The reporter went missing after ____.” → **Visiting the Saudi consulate for paperwork.** — This is Khashoggi, the real reporter who went missing, delivered deadpan.
- “The meaning of life, revealed on the deathbed: ____.” → **Rosebud. It was a butt plug.** — This calls back to the most famous deathbed word in film, with a crude reveal.
- “The cult philosopher's followers ended up as ____.” → **Corpses in matching Nikes.** — This is Heaven's Gate: the real cult whose followers ended up exactly like this.
- “What did the influencer bury for content?” → **The adopted kid, once the views dropped.** — This calls back to the real YouTuber who 'rehomed' her adopted son when he stopped being content.
- “The software's hidden feature was ____.” → **Boeing's surprise nose-dive mode.** — MCAS was a real hidden software feature that crashed planes.
- “The help desk's last ticket read "____."” → **Have you tried turning him off and on again?** — The help desk's catchphrase applied to a person makes it a murder note.
- “The candidate's opponent disappeared after ____.” → **Saying Epstein didn't kill himself.** — This is the one sentence everyone jokes will get you disappeared.
- “The store's walk-in freezer held ____.” → **Walt Disney's head.** — The cryogenic urban legend everyone knows, found in the least magical freezer on Earth.
- “What did the recount uncover?” → **Hanging chads, and one hanged Chad.** — It takes the Florida 2000 'hanging chads' and turns it into a dead guy named Chad.
- “Death row's last meal request was ____.” → **Seconds.** — He asks for seconds, meaning both another helping and more time before the execution.
- “The warden's basement held ____.” → **Jeffrey Epstein, alive and well.** — The 'Epstein didn't kill himself' conspiracy: the cameras failed because the warden kept him.
- “The zoo's feeding schedule now includes ____.” → **Carole Baskin's husband.** — The Tiger King meme says she fed her husband to the tigers, which is exactly what a feeding schedule is for.
- “The aquarium's shark tank was fed ____.” → **Kevin O'Leary, and for that reason, he's out.** — The TV Shark Tank against the real one. Mr. Wonderful gets fed, and his catchphrase is the punchline.
- “The petting zoo's incident involved ____.” → **Heavy petting.** — The petting zoo's incident was heavy petting: the pun is right there in the prompt.
- “My tax shelter was ____.” → **Anne Frank's attic.** — Shelter means hiding, and the most famous hiding place was also the worst audit.
- “What did the prison cook serve on Sundays?” → **Tossed salad.** — Prison slang for rimming, served as the Sunday side dish.
- “What did the knight's armor contain?” → **A torso insisting it's just a flesh wound.** — The Monty Python Black Knight: what's left inside the armor after he loses all his limbs.
- “What happens in Vegas gets buried in ____.” → **Lake Mead, until the drought.** — The 2022 drought at Lake Mead exposed mob bodies in barrels, a real Vegas burial callback.
- “The high roller paid his debt with ____.” → **His other kidney.** — 'Other' is the joke: the casino already has the first one.
- “The magic act's disappearing trick worked because of ____.” → **Dad's trip out for cigarettes.** — The world's most famous disappearing act, the dad who went out for cigarettes and never came back.
- “The masseuse kept ____ in the back room.” → **Robert Kraft.** — The Patriots owner busted at a day spa. He's the most famous back-room massage customer in America.
- “The psychic's prediction came true when ____.” → **Getting entered by a tall, dark stranger.** — The classic fortune says a tall, dark stranger will enter your life. Here 'enter' is literal.
- “What did the spa do with the skin?” → **It rubs the lotion on its skin.** — Buffalo Bill's line from Silence of the Lambs, which is also exactly what a spa does to skin
- “The Texas ranch's back forty held ____.” → **Forty sister wives.** — A pun on 'back forty', plus the FLDS polygamist ranch in Texas
- “The border wall was built with ____.” → **Undocumented workers, paid in cash.** — The obvious irony of the wall, and a nod to Trump's own companies using undocumented labor
- “The Texas execution chamber's waiting room served ____.” → **Texas toast.** — A real Texas side dish, and everyone waiting there is 'toast'
- “The New York subway's third rail took ____.” → **Jared from Subway.** — A pun on Subway with a disgraced pitchman, and the room is glad the rail got him
- “The Hudson washed up ____.” → **Rudy Giuliani.** — New York's most washed-up man literally washing up, hair dye running
- “The Silicon Valley startup's product was made from ____.” → **A single drop of blood, allegedly.** — Theranos: the startup whose product was supposedly made from one drop of blood
- “What did the New York landlord do with the tenants?” → **Rent-stabilized them, in concrete.** — A pun on New York's rent-stabilized apartments and on mob concrete shoes
- “The Southern plantation tour skipped ____.” → **The slavery part.** — A deadpan truth: plantation tours really do skip the slavery
- “The Canadian's apology covered ____.” → **Trudeau's blackface, all three times.** — Canada's most famous apology, made by its prime minister, several times
- “The hockey rink's Zamboni ran over ____.” → **Nancy Kerrigan's other knee.** — The Tonya Harding kneecapping: the ice rink finally finishes the job
- “The Paris catacombs' newest residents were ____.” → **Mimes. They went quietly.** — Parisian mimes killed off, with a pun on 'went quietly'
- “The tour group came back missing ____.” → **Natalee Holloway.** — The Aruba senior trip that really came back missing a student
- “What did the ice fishing hole bring up?” → **Jack, still mad about the door.** — Titanic's Jack froze and sank, and there was room on the door; now he surfaces through the ice
- “What did the tourist's luggage contain at customs?” → **Madeleine McCann.** — The most famous child ever taken from a tourist family, found in a tourist's luggage
- “The cat's "gift" on the porch was ____.” → **Tweety, finally.** — Sylvester finally won after 60 years. 'Finally' is the punchline.
- “The vet's back room held ____.” → **The farm upstate.** — The lie every parent told about the family dog, and it turns out the farm upstate is the vet's back room.
- “The blizzard trapped the family with ____.” → **Jack Nicholson and an axe.** — The Shining is the blizzard-trapped-family story. 'Here's Johnny' writes itself.
- “The government form's last question was about ____.” → **Being a Nazi, specifically between 1933 and 1945.** — Real US immigration forms do ask whether you took part in Nazi persecution between 1933 and 1945. People who have filled one out will laugh in recognition.
- “I watched the clerk process ____ without looking up.” → **Hitler's art school application.** — The famous 'if only art school had let him in' what-if. The clerk who did not look up caused World War II.
- “Jury duty ended when ____.” → **The glove didn't fit.** — 'If it doesn't fit, you must acquit.' Everyone knows how that jury duty ended.
- “What did the ice storm reveal?” → **Shrinkage.** — Seinfeld's 'I was in the pool!' The one-word version lands instantly.
- “The space station's crew came back as ____.” → **Astronaut ice cream.** — Astronaut ice cream is freeze-dried, so the crew came back freeze-dried. It is a pun and a dark image at once.
- “The nativity scene's baby was actually ____.” → **Baby Hitler, and you had one chance.** — The famous 'would you kill baby Hitler' question, set in a manger.
- “The office party ended with ____ in the freezer.” → **Toby from HR, finally.** — Michael Scott's lifelong wish finally comes true in The Office callback.
- “The nursing home's turnover was explained by ____.” → **Andrew Cuomo's paperwork.** — The real COVID nursing-home order scandal. It is the true answer to this blank.
- “Grandpa's will was rewritten by ____.” → **Anna Nicole Smith.** — She married an 89-year-old oil billionaire. It is the definitive rewritten-will story.
- “The MLM's top earner sold ____.” → **Actual pyramids, slaves included.** — Pyramid-scheme pun: the top earner sells literal pyramids, and the downline are the slaves.
- “The wellness retreat's graduates were found ____.” → **In matching Nikes, under purple shrouds.** — Heaven's Gate: the members were found dead in matching Nikes under purple cloths.
- “What did the office party's photo booth capture?” → **The CEO and the head of HR, Coldplay-style.** — The 2025 kiss-cam affair: a CEO and his HR chief caught on camera at a Coldplay show.
- “What did the home care nurse do with the ones who didn't pay?” → **Billing the estate for the pillow.** — Implies the smothering, then charges for it: a collections joke.
- “The smell from the closet was ____.” → **Poppers and denial.** — "In the closet" pun: the smell is poppers, the rest is denial.
- “The gas station's ice machine held ____.” → **My other kidney.** — The waking-up-in-ice-missing-a-kidney urban legend: the gas station has the other one.
- “The cooking show's mystery ingredient was ____.” → **Soylent Green.** — "Soylent Green is people": the mystery-ingredient reveal.
- “The bake-off's winning cake was made of ____.” → **Actual ladyfingers.** — Ladyfingers are a cake ingredient; actual ones are women's fingers.
- “The ad campaign's "real people" were ____.” → **Crisis actors.** — Alex Jones's Sandy Hook lie flipped: the "real people, not actors" were crisis actors.
- “The last survivors kept ____ as a pet.” → **Keith Richards.** — The running joke that only cockroaches and Keith Richards survive the apocalypse.
- “My date's trunk had ____ in it.” → **Duct tape, a shovel, and a single rose.** — A serial-killer kit with a romantic touch: exactly what a date's trunk should not hold.
- “The internship's final task was ____.” → **Dry-cleaning Monica's blue dress.** — The Lewinsky blue dress: the internship callback the room knows.
- “Who did 9/11?” → **Flight-school students who skipped the landing lesson.** — It's a callback to the real detail that the hijackers trained to fly but didn't care about landing. The room recognises it and it's dark.

## Verified pairings with existing cards (176 pairings: 152 new tags on 90 cards, the rest already tagged)

- “Our priest lost his faith after ____.” → **The rapture, but only for hot people.** (serendipity) — The rapture came and he got left behind for being ugly.
- “My proctologist found ____.” → **MH370.** (callback) — The famously missing plane finally turns up.
- “Someone brought ____ to the orgy and it got weird.” → **Chris Hansen.** (callback) — 'Why don't you have a seat?' Everyone knows why it got weird.
- “What did the coroner find in my stomach?” → **The Donner Party.** (callback) — You ate the whole wagon train.
- “What's the porn star's stage name?” → **Little Caesar.** (pun) — Hot-N-Ready, and very little. A real porn-name pun.
- “What's my fetish?” → **Bush.** (pun) — Double meaning: pubic hair or George W.
- “My mom's porn name is ____.” → **Load-bearing.** (pun) — Pun on 'load'. Brutal for your mom.
- “What did the nuns confiscate?” → **A rosary made of anal beads.** (specific) — Exactly the thing Catholic school nuns would take away.
- “What did I find at the bottom of the hot tub?” → **Matthew Perry.** (callback) — He died in his hot tub. Exact and horrible.
- “What's the mystery meat?” → **Harambe.** (callback) — This is the blank where Harambe works: the zoo had to do something with him.
- “Grandpa's new nickname at the retirement home: "____."” → **Ol' Faithful.** (pun) — Incontinence, on schedule. A perfect old-man nickname.
- “What's the CIA's new interrogation technique?” → **Flint tap water.** (callback) — Waterboarding, but with Flint water. Worse.
- “What made me pass out in the strip club bathroom?” → **Bill Cosby.** (callback) — Passing out after a drink ties straight to Cosby. It is a dark callback, just like 'Who did 9/11? Bush.'
- “What's the worst thing to hear during a colonoscopy?” → **Ol' Faithful.** (specific) — You hear the name of a geyser during a colonoscopy, so you know exactly what just happened.
- “What did the plumber pull out of the toilet?” → **Pull-out failure.** (pun) — It echoes 'pull out' in the prompt and quietly implies a flushed fetus. Pun plus dark.
- “My uncle's basement is full of ____.” → **Diddy's thousand bottles of baby oil.** (callback) — Creepy-uncle basement plus the Diddy raid haul. The room makes the connection instantly.
- “What's my gynecologist's nickname for me?” → **Ol' Faithful.** (specific) — A geyser nickname from the gynecologist says everything without saying anything.
- “I invented a sex position and named it "____."” → **Turducken.** (specific) — Three people stuffed inside each other. The name describes the position perfectly.
- “I invented a sex position and named it "____."” → **OceanGate.** (callback) — You go down, never come back up, and it implodes. A dark callback that reads as a position.
- “I invented a sex position and named it "____."” → **The Donner Party.** (callback) — A group position where everyone eats each other. Cannibalism turns into oral.
- “What's the fraternity's hazing ritual this year?” → **Ancient Greek wrestling, as intended.** (pun) — Greek life meets naked ancient Greek wrestling. A frat pun with a gay twist.
- “What finally ended the marriage?” → **O.J.'s glove.** (callback) — The most famous marriage-ending evidence in America. The room gasps, then laughs.
- “Tonight on the adult channel: ____.” → **The Titanic going down on the iceberg.** (pun) — 'Going down' works as porn and as shipwreck. A porn-parody pun.
- “What did the raccoons do to the corpse?” → **Eating ass like it owes you money.** (serendipity) — Raccoons really do eat the corpse. The sex idiom becomes literal scavenging.
- “What's the worst thing to have in your mouth right now?” → **The Unabomber's package.** (pun) — 'Package' as genitals and as mail bomb. A double-meaning pun.
- “What made the Uber driver pull over?” → **"Are we there yet" from the trunk.** (serendipity) — A voice from the trunk is exactly what makes a driver stop the car. Dark and funny.
- “What's the nursing home's new activity?” → **Rewriting the will with a pillow.** (serendipity) — The nursing home 'activity' is smothering for inheritance. Dark serendipity.
- “How did the neighbors find out?” → **The smell of a body found in August.** (serendipity) — How neighbors always find out: the smell. The August detail makes it.
- “What did the dog lick?” → **Peanut butter in unusual places.** (callback) — The infamous peanut-butter-and-the-dog meme; everyone knows where.
- “My safe word is "****," but my wife's is "****."” → **Chris Hansen.** (callback) — Saying his name is what makes everyone stop: 'why don't you have a seat.'
- “My safe word is "____."” → **Chris Hansen.** (callback) — The name that ends every encounter: 'why don't you have a seat.'
- “The porn parody of "Titanic" features ____.” → **The Titanic going down on the iceberg.** (pun) — 'Going down' does the double meaning of the porn parody.
- “I lost my virginity to ____.” → **Bill Cosby.** (callback) — 'Lost' is the word: you don't remember it happening.
- “My dick pic was captioned "____."” → **Soft launch.** (pun) — A "soft launch" is teasing something small and not yet ready, and here it is also a limp dick.
- “What's the worst thing to whisper during sex?” → **Oopsie.** (specific) — The one word nobody wants to hear mid-act: the condom broke, or it went in the wrong hole.
- “What's the worst thing to whisper during sex?” → **Bill Cosby.** (callback) — Whispering his name during sex means "check your drink": a dark callback the room gets instantly.
- “I'd trade my firstborn for ____.” → **Harambe.** (callback) — Harambe died so a child could live: trading your kid to get him back is the meme itself.
- “My husband's search history is just ____.” → **Chris Watts.** (serendipity) — A husband researching the man who murdered his wife: the most alarming search history possible.
- “I went to the glory hole and it led to ____.” → **Chris Hansen.** (callback) — To Catch a Predator sting: 'why don't you have a seat.'
- “My tramp stamp says "____."” → **Load-bearing.** (pun) — Reads as a structural warning on the lower back, with a 'load' pun.
- “Joe Rogan's newest guest talked about ____ for three hours.” → **Getting your face eaten by a monkey.** (callback) — Rogan's endless chimp-rips-your-face-off bit.
- “The anal beads were made of ____.” → **Stranger's teeth on a string.** (serendipity) — Teeth on a string are exactly the shape of anal beads. Horribly right.
- “The anal beads were made of ____.” → **Velcro.** (specific) — One word, and everyone winces on the way out.
- “What did the escort find in the senator's pockets?” → **Big Pharma.** (pun) — 'In the senator's pocket' taken literally: lobbying humor.
- “What's under the bishop's robe?” → **Cock cage for Lent.** (specific) — Exactly what a devout bishop would hide under the robe; the Lent detail makes it.
- “My kink is ____.” → **Room temperature.** (serendipity) — Sounds harmless, then the room realises it means corpses.
- “The morning after, I woke up next to ____.” → **Diddy.** (callback) — The freak-off morning after, baby oil and all.
- “The dildo review said "____."” → **Hard pass.** (pun) — A one-line review with 'hard' doing the double meaning.
- “What's Trump's safe word?” → **The Epstein files.** (callback) — The two words guaranteed to stop Trump cold, which is all a safe word does.
- “What did they find in the Titanic wreck's honeymoon suite?” → **OceanGate.** (callback) — The real sub that imploded on its way to the Titanic wreck. Dark and current.
- “My worst hookup involved ____.” → **Jeffrey Dahmer.** (callback) — Dahmer picked his victims up as hookups. 'Worst' is the understatement of the century.
- “What's the kinkiest thing at the county fair?” → **Creampie at the pie-eating contest.** (pun) — Creampie meets the pie-eating contest, the most county-fair event there is.
- “The sex tape's title is "____."” → **Consensual, mostly.** (serendipity) — A horribly honest title for a sex tape. It is dark and specific.
- “What did the bachelor party pay for?” → **The Tijuana donkey show.** (callback) — The legendary bachelor-party purchase of urban myth.
- “The gloryhole's sign reads "____."” → **Load-bearing.** (pun) — A construction warning that doubles as a cum joke. It is a perfect sign for the wall.
- “My ex's final text was about ____.” → **OceanGate.** (callback) — 'Final text' becomes literal: the ex was on the sub.
- “The porn star's tell-all names ____.” → **Trump's micropenis.** (callback) — Calls back Stormy Daniels's tell-all and her infamous description of Trump's penis.
- “The Titanic's last dinner was ____.” → **OceanGate.** (callback) — Callback: the Titanic wreck literally ate the OceanGate sub. Its last dinner, 111 years later.
- “The sex ed video used ____ as an example.” → **Bill Cosby.** (callback) — The consent chapter of the sex ed video, starring America's Dad.
- “The sex ed video used ____ as an example.” → **Casey Anthony.** (serendipity) — Used "as an example" of why you wear a condom. Dark and it lands.
- “What did the priest bless by mistake?” → **A rosary made of anal beads.** (specific) — The priest blesses what looks like a rosary but is anal beads. It is the exact mistake the blank asks for.
- “What's the safe word at a funeral home?” → **Room temperature.** (pun) — Funeral-home PUN: the safe word is the temperature every client is at.
- “The cursed Craigslist ad offered ____.” → **Alec Baldwin's prop gun.** (callback) — Callback: the one real cursed object everyone knows, listed on Craigslist.
- “What did Stalin keep in his nightstand?” → **Hitler's one testicle.** (serendipity) — Callback: the Soviets really kept Hitler's remains, so a war trophy in the nightstand is plausible.
- “The trucker's glory hole review said "____."” → **Hard pass.** (pun) — A one-line review that is also a double pun: hard, and passing through the hole.
- “The trucker's glory hole review said "____."” → **Load-bearing.** (pun) — It sounds like a structural inspection note and it's a cum pun, which is what a trucker's review would say.
- “The cruise ship's adults-only lounge features ____.” → **The Titanic going down on the iceberg.** (pun) — The most famous cruise ship 'going down' in the adults-only lounge: pun plus callback.
- “What did the coroner write in the notes?” → **Room temperature.** (serendipity) — A clinical coroner's note that is also the slang for being dead.
- “My sex ed teacher's example was ____.” → **A cucumber that's seen too much.** (callback) — Calls back to the condom-on-a-vegetable demo, and 'seen too much' says where the teacher's cucumber has been.
- “The porn star's contract rider demands ____.” → **Diddy's thousand bottles of baby oil.** (callback) — The thousand bottles of baby oil already read like a diva's rider, so this is the perfect callback.
- “What did the séance reveal about Grandma?” → **Rewriting the will with a pillow.** (serendipity) — The séance reveals how Grandma really died and who wanted the inheritance.
- “The porn parody mixes ____ with ____.” → **Bush.** (pun) — In a porn parody the president becomes pubic hair: a double meaning with no setup needed.
- “The porn parody mixes ____ with ____.” → **The Donner Party.** (pun) — A Donner Party porn parody is about 'eating out'. A dark historical pun.
- “Hell is ____ for eternity with ____.” → **Chris Hansen.** (callback) — An eternity of 'why don't you have a seat' is the pervert's version of hell.
- “The Vatican's basement holds ____ and ____.” → **A choir boy, now forty and horny.** (callback) — The abuse-scandal callback, and 'now forty' means he has been kept in the basement for decades.
- “My therapist charges double for ____ and ____.” → **The Menendez brothers.** (callback) — They confessed to their therapist, whose tapes convicted them. The real double-billing therapy case.
- “The cruise's adults-only deck offers ____ and ____.” → **The Titanic going down on the iceberg.** (pun) — The most famous cruise going down on the adults-only deck: pun plus callback.
- “Grindr is ____ wearing ____.” → **Jeffrey Dahmer.** (callback) — Dahmer picked up his victims at gay bars. Grindr is the modern version, which makes this a dark callback.
- “The sex shop's clearance bin holds ____ and ____.” → **Edible underwear from 1998.** (specific) — The exact thing that sits unsold in a sex shop's clearance bin for decades, and you're meant to eat it.
- “My funeral will feature ____ and ____.” → **The killer's tearful eulogy.** (serendipity) — The murderer giving the eulogy at your own funeral, as in every true-crime story.
- “The coroner listed ____ and ____ on the report.” → **Room temperature.** (serendipity) — A clinical line on a coroner's report that is also slang for dead.
- “My worst date ended with ____.” → **Chris Hansen.** (callback) — To Catch a Predator: the date ends with Chris Hansen saying "have a seat," and every room knows the scene.
- “What did the coroner refuse to touch?” → **Flint tap water.** (callback) — Someone who handles corpses all day still will not touch Flint water.
- “What's on the sex tape's blooper reel?” → **Sneezing during a rim job.** (specific) — A sneeze in the middle of a rim job is a real outtake.
- “The prenup adds a clause about ____.” → **Post-nut clarity.** (pun) — Prenup and post-nut: the clause is about the clarity that comes after.
- “What did the priest keep in his desk?” → **Shoebox of Polaroids.** (serendipity) — A shoebox of Polaroids in a priest's desk says the whole scandal without a word.
- “What's the cruise's adults-only theme night?” → **The Titanic going down on the iceberg.** (pun) — Titanic theme night, and "going down on" is the pun.
- “Porn shoot cancelled because of ____.” → **Alec Baldwin's prop gun.** (pun) — Alec Baldwin's prop gun shut down a real shoot. Pun on "shoot" and a real callback.
- “What did the nurse pretend not to see?” → **Rewriting the will with a pillow.** (serendipity) — A relative smothering the patient to rewrite the will is what the nurse looks away from.
- “My worst hookup story ends with ____.” → **Chris Hansen.** (callback) — To Catch a Predator: the hookup ends with "why don't you have a seat."
- “The bachelor party's stripper refused ____.” → **Bill Cosby.** (callback) — A stripper who refuses Bill Cosby is refusing the drink. The room gets it at once.
- “My prenup's strangest clause covers ____.” → **Post-nut clarity.** (pun) — Prenup and post-nut: the strangest clause covers post-nut clarity.
- “My therapist wrote ____ and underlined ____.” → **Yikes forever.** (specific) — A professional giving up in writing: the underlined note is just 'Yikes forever.'
- “What did Hitler's art teacher write on his report card?” → **Hard pass.** (callback) — Callback to Hitler's art-school rejection, the note that 'caused' WWII.
- “What did the lockdown do to your dad?” → **Cumming to a Peloton instructor.** (callback) — The Peloton craze was the defining lockdown purchase, and this is what it did to Dad.
- “Putin's newest window-cleaning service specializes in ____.” → **Trust-falling off the roof.** (callback) — Callback to Russian oligarchs and critics 'falling' from windows; a trust fall is the service.
- “Watergate's missing 18 minutes were about ____.” → **Trump's pee tape.** (callback) — Presidential tape scandal meets presidential tape scandal: the missing minutes were the pee tape.
- “____ and ____: what the Roomba mapped in the crawlspace.” → **John Wayne Gacy.** (callback) — Gacy buried his victims in his crawlspace; the Roomba found the most famous one.
- “The Halloween costume that got the cops called: ____.” → **Wearing the neighbor for Halloween.** (serendipity) — An Ed Gein costume made of the neighbor. Of course the cops come.
- “Turns out the food truck's meat came from ____.” → **Jeffrey Dahmer.** (callback) — The cannibal whose freezer everyone knows. Mystery meat solved.
- “The smart speaker called 911 about ____.” → **A safe word that's just screaming.** (serendipity) — Alexa can't tell the kink from a murder. It's the exact misunderstanding.
- “The dating app's new filter screens for ____.” → **Chris Hansen.** (callback) — The app screens for To Catch a Predator stings, which says who its users are.
- “What did the robot vacuum sweep under the rug?” → **The Epstein files.** (callback) — The most famous thing swept under the rug. It lands the idiom perfectly.
- “Housekeeping found the rock star's hotel room full of ____.” → **Diddy's thousand bottles of baby oil.** (callback) — The freak-off hotel rooms were the exact scene in the Diddy indictment.
- “The Christmas miracle turned out to be ____.” → **Pull-out failure.** (serendipity) — The original Christmas miracle, explained crudely. Short and blasphemous.
- “The hotel's "do not disturb" sign was hiding ____.” → **Harvey Weinstein.** (callback) — Weinstein's hotel-room 'meetings' are the textbook do-not-disturb scandal.
- “The hotel's "do not disturb" sign was hiding ____.” → **Diddy's thousand bottles of baby oil.** (callback) — Calls back to Diddy's hotel freak-offs from the indictment.
- “What did the coroner find in the stocking?” → **Autoerotic asphyxiation.** (pun) — Coroner plus stocking: the nylon kind, knotted. The Christmas stocking turns into a cause of death.
- “The prison riot started over ____.” → **Diddy's thousand bottles of baby oil.** (callback) — Diddy is inside now, and the whole block wants the lube.
- “The evidence locker's missing item: ____.” → **Trump's pee tape.** (callback) — The most famous piece of 'evidence' that never turned up.
- “The experiment's control group ended up ____.” → **Room temperature.** (pun) — Euphemism for dead, delivered in dry lab-report language.
- “The plumber pulled ____ out of the septic tank.” → **Lincoln's log.** (pun) — 'Log' as a turd: a presidential dump pulled from the septic tank.
- “What was the DIY project really for?” → **A guest room with a lock on the outside.** (serendipity) — Weekend renovation turned Fritzl basement. The reveal that 'really' implies.
- “The storm washed up ____.” → **Matthew Perry.** (pun) — A double pun: 'washed up' as a has-been, and a drowning in a hot tub.
- “The forest fire was started by ____.” → **A gender reveal with a body count.** (callback) — Gender reveals really have started wildfires that killed people.
- “My trunk rattled the whole drive because of ____.” → **A bag of teeth.** (specific) — The one answer that literally rattles, and why you have it is awful.
- “The eulogy was interrupted by ____.” → **Apple Watch: "It looks like you've died."** (specific) — The dead man's own watch pings mid-eulogy. A perfectly specific, believable interruption.
- “What was buried with him?” → **Jeffrey Epstein's guest list.** (callback) — The Epstein conspiracy in one line: the list died with him.
- “The nanny cam caught ____.” → **Casey Anthony.** (callback) — The mother the nanny cam should have been watching. The room knows the case.
- “The retirement home's real business was ____.” → **Rewriting the will with a pillow.** (serendipity) — The inheritance racket in five words, with the murder weapon included.
- “What was in the baby formula?” → **Ambien.** (serendipity) — The desperate parent's secret for a baby that sleeps through the night. One word, horribly right.
- “The spy's last transmission was about ____.” → **Trump's pee tape.** (callback) — The ultimate kompromat. The Steele-dossier callback lands with any room.
- “Historians agree the war was started over ____.” → **Hitler's one testicle.** (callback) — The 'Hitler has only got one ball' song meets overcompensation theory: WWII started over a missing nut.
- “Historians agree the war was started over ____.” → **Bush.** (pun) — Works two ways: an Iraq War callback, and a Helen-of-Troy war fought over a woman's bush.
- “Our house was cheap because of ____.” → **John Wayne Gacy.** (callback) — Bodies in the crawl space are the real-estate discount everyone knows.
- “The pirates' loot was mostly ____.” → **Thicc.** (pun) — Pirate booty read as ass. The room finishes the pun itself.
- “Who did I wake up next to in Reno?” → **Diddy.** (callback) — Waking up after a freak-off, covered in baby oil.
- “Who's the new youth pastor?” → **Ghislaine Maxwell.** (callback) — Put in charge of the youth group, she's the most alarming hire possible.
- “Who ruined the orgy?” → **Chris Hansen.** (callback) — 'Why don't you have a seat': the To Catch a Predator host walking in is the ultimate buzzkill.
- “Who officiated the wedding at the Waffle House?” → **A pimp named Reverend.** (serendipity) — A 'Reverend' is technically an officiant, and a pimp is exactly who's in a Waffle House at 3 a.m.
- “Who did the dog choose?” → **Peanut butter in unusual places.** (serendipity) — The crude peanut-butter joke everyone knows. The dog chose whoever had it.
- “The roller coaster's last car came back with ____.” → **Wig, scalp still attached.** (serendipity) — The dark joke about low beams and loose restraints: the rider didn't come back, the scalp did.
- “The circus's new act was ____.” → **The lion tamer, mostly inside the lion.** (serendipity) — The classic circus act gone horribly and specifically wrong, sold as the new act.
- “TSA found ____ and let it through.” → **Alec Baldwin's prop gun.** (callback) — TSA waved it through because it's 'just a prop.' Same reasoning as on the Rust set.
- “The gym's missing members were traced to ____.” → **Twelve dicks in a trench coat.** (pun) — Members = dicks. The missing gym members were hiding in a trench coat.
- “The mall Santa's list was really ____.” → **Jeffrey Epstein's guest list.** (callback) — Swapping one famous list for another. The naughty list really is a list of names.
- “The royal succession was settled by ____.” → **Paternity test, live on daytime TV.** (callback) — Royal Maury: 'Charles, you are NOT the father.' Plays on the Harry–Hewitt rumor.
- “The college's endowment came from ____.” → **A dick so big it has its own zip code.** (pun) — It plays on 'well-endowed': the college's endowment is a huge dick.
- “What did the recycling sorter pull off the belt?” → **Autoerotic asphyxiation.** (pun) — 'Pull off the belt' reads as the belt around someone's neck. It's a filthy double meaning.
- “The meaning of life, revealed on the deathbed: ____.” → **Post-nut clarity.** (specific) — All that wisdom, and the dying man's big revelation is the feeling you get right after you cum.
- “What did the trawler's net bring up?” → **Osama bin Laden.** (callback) — The SEALs dumped him at sea, so the fishing net finally found him.
- “The campaign's ground game involved ____.” → **Burying a body in the community garden.** (pun) — 'Ground game' taken literally, with 'community' making it grassroots too.
- “What did the recount uncover?” → **Bush.** (callback) — The 2000 Florida recount uncovered Bush. It is the one recount everyone remembers.
- “The Renaissance fair's execution reenactment used ____.” → **Alec Baldwin's prop gun.** (callback) — A 'harmless' reenactment with a prop gun calls back to Rust, and it's anachronistic too.
- “The salon's hair extensions came from ____.” → **The Holocaust Museum gift shop.** (callback) — Auschwitz is famous for the tons of victims' hair on display, so the extensions came from there.
- “What did Florida Man feed the gators?” → **The HOA, personally.** (serendipity) — Every Florida homeowner's revenge fantasy, answered exactly
- “The Mountie's cabin held ____.” → **The Mountie always gets his man, and keeps him.** (callback) — Twists the Mountie motto into a captive, and a closeted gay, in his cabin
- “The flood washed up ____.” → **Matthew Perry.** (pun) — Double meaning: 'washed up' as a has-been celebrity, and he actually died in water, in a hot tub.
- “The plague God sent this time was ____.” → **Flint tap water.** (callback) — God turned the water to blood in Egypt. Flint is the modern sequel.
- “The thrift store's donation bin contained ____.” → **O.J.'s glove.** (pun) — It didn't fit, so it got donated. 'If it doesn't fit' is exactly why things end up in a donation bin.
- “The estate sale was early because of ____.” → **The Menendez brothers.** (callback) — They are the reason the parents' estate came up early, and they wanted the money.
- “The white elephant gift was ____, still warm.” → **The pope's Fleshlight.** (serendipity) — 'Still warm' means the pope just used it. The prompt's tag finishes the joke.
- “The MLM's top earner sold ____.” → **Essential oils distilled from the ones who left.** (specific) — Essential oils are THE MLM product; distilled from the quitters makes it land.
- “The wellness retreat's graduates were found ____.” → **Room temperature.** (serendipity) — "Found room temperature" is the coroner euphemism for dead.
- “What did the smart doorbell record every night?” → **Pizza guy, no pizza.** (callback) — The porn-plot pizza guy with no pizza, on camera every night: the affair.
- “The bake-off's winning cake was made of ____.” → **A yeast infection that smells like bread.** (pun) — Yeast pun: the winning bake was proofed on a yeast infection that smells like bread.
- “The focus group never left because of ____.” → **The Midwest goodbye, ending politely in the wood chipper.** (callback) — The Midwest goodbye that never ends, finishing in the wood chipper.
- “The bunker's food ran out and we ate ____.” → **Armie Hammer.** (callback) — Armie Hammer's cannibal-fetish texts: he would have volunteered.
- “The app matched me with ____, and I never came back.” → **Jeffrey Dahmer.** (callback) — Dahmer dates did not come back.
- “Her bio said "must love ____," and she meant it.” → **Raw dog.** (pun) — "Must love dogs" becomes "must love raw dog".
- “The kids' party's magician made ____ disappear.” → **The Epstein files.** (callback) — The Epstein files keep vanishing; the magician did it.
- “The internship's final task was ____.” → **Oval Office glory hole.** (callback) — Clinton and Lewinsky: the most famous internship final task.
- “What's in the bunker's freezer?” → **Hitler's one testicle.** (callback) — Hitler's bunker, and his famous missing testicle, kept frozen.
- “What did the crematorium worker take home?” → **Barbecue Steve.** (pun) — In this blank the card's meaning changes from 'the cookout guy' to 'Steve, barbecued', so the worker took Steve home. The double meaning is the laugh.
- “I wish I could hire ____ as a babysitter.” → **Chris Watts.** (callback) — Same shape as the owner's Lindsay Clancy example: a real parent who killed his own kids, handed the job of watching the kids.

## Not applied (15)

The cards already carrying 8 tags (Chris Hansen, Bill Cosby, Diddy, the Donner Party) — a card is kept to a few prompt families so one callback cannot take every round.

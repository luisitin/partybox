// How a white card fits a black card (owner, 2026-09-18: "some answer cards only make sense with
// some question cards"). A black card asks for one SLOT — a thing (most of them), something
// someone did (`doing`: "What did the sex robot refuse to do?"), a person (`person`: "Who…?",
// "…goes to ____"), or a name — a title, a safe word, a nickname, something said (`name`: 'The
// porn parody of my life is called "____."', "What did the best man say in his toast?") — read
// off its text, or set on the card (`slot` in the deck JSON). A white card SERVES slots: a gerund
// card is a `doing`, a card about someone ("A therapist who takes notes with a shudder.") a
// `person`, the rest `thing`s, and any short card (four words or fewer) also a `name` — and FIT
// says how each reads in the others' blanks (a person is a fine thing; a thing is a poor doing;
// a long card is a poor safe word). `fitScore` is the soft match dealing, bots and the fit report
// share; `tier` (1 filler, 2 good, 3 great — set on the card, default 2) is how good the card is
// on its own.
import type { BlackCard, WhiteCard } from '../content/schema';

export const SLOTS = ['thing', 'doing', 'person', 'name'] as const;
export type Slot = (typeof SLOTS)[number];

/** Prompts whose blank wants an action or an event. */
const DOING_PROMPT = [
  /\b(?:do|doing|done|does)(?: again| anymore| twice| for money)?\?["”]?$/i, // "What did the sex robot refuse to do?", "…won't do again?", "…the roommate does?"
  /\b(?:done|doing) (?:on|at|in|for|to|with|during|while)\b/i, // "the wildest thing you've done on the clock?", "What's Obama doing with…?"
  /\b(?:real|hidden|secret|true) talent\b|\bpunishment (?:for|is|was)\b|\bpunishment\?$/i,
  /\b(?:cut short by|ends? (?:\w+ )?(?:with|in)) ____/i, // "The bedtime story ends with ____.", "cut short by ____"
  /^____ and ____: what\b/, // "____ and ____: what the Airbnb's two hidden cameras caught."
  /\bdo (?:at|in|on|to|with|for|instead|before|after|during|while|when|all day|every)\b/i, // "What did Lincoln do at…", "…do while I'm at work?"
  /\b(?:was|is|were) actually (?:[A-Z][\w']+ ){1,3}____/, // "The moonwalk was actually Michael Jackson ____."
  /\b(?:does|did|caught (?:me|him|her|them|us|the \w+)|busy|instead of|after|before|while|during|in the middle of|conceived during|spent (?:the \w+|\w+ years?)|most likely to|made (?:me|us|them|him|her) do|performed|opened with|threw a flag for|flag for)\s+____/i,
  /["“]Most Likely To["”] was ____/i, // the yearbook's
  /\b(?:best|worst|favou?rite|only|fastest|quickest) way to \w+/i, // "The best way to annoy a sibling: ____."
  // (No trailing \b: after "on?" the end of the text is no word boundary — "What did the kids walk
  // in on?" read as a thing for twenty passes.)
  /\b(?:what happened|what went wrong|walk(?:ed)? in on\?|catch (?:\w+ )+doing\b|am I doing\b|are you doing\b|^how did\b|^why\b)/i,
  /\b(?:pulled (?:me|us|him|her) over|in trouble|grounded|detention|suspended|deported|excommunicated|disqualified|demonetized|cancel(?:l)?ed) (?:\w+ )?for ____/i,
  /\b(?:ruined|interrupted|cancelled|canceled|delayed|caused|started|ended|followed|triggered|brought on) by ____/i,
  /\b(?:led to|ended (?:\w+ )?(?:with|in)|started with|began with) ____\.?$/i,
  // "What got me banned…?", "What ended the marriage?", "the secret to a happy marriage", "the
  // CIA's new interrogation technique": what someone did, or does.
  /^What (?:got|ended|finally ended|killed|ruined|started|caused|broke up)\b/i,
  /\b(?:technique|trick|secret to|real reason for|reason the [\w' ]+ ended|mistake (?:was|is)|biggest mistake|first mistake|mistake: ____|strategy (?:was|is)|plan (?:was|is)|never live down|live down|alibi (?:is|was|involves)|shalt not|practi[sc]e)\b/i,
  /\b(?:turned into|opens with|cuts to|closes with) ____/i, // "…trust exercise turned into ____", "The sex tape opens with ____"
  /\b(?:done|did|loved|dare (?:was|is)|ritual (?:was|is)): ____|doing what \w+ loved/i,
  /\b(?:arrested|fired|executed|burned|shut down|raided|resigned|banned|expelled|sued|jailed|convicted|dumped|put (?:\w+ ){1,2}down|quit|walked out|kicked out)\b[^.]* (?:for|over) ____/i,
  // A ritual, a dare, an activity, a way to get something: what someone does.
  /\b(?:ritual|hazing|dare|tradition|activity|hobby|pastime|challenge|way to get|specializes in|known for|charged? extra for|signature move|finishing move|move in bed|new event: ____|as an event)\b/i,
];
/** "Renamed itself after ____", "modeled after ____": a thing, not an event after which. */
const NAMED_AFTER = /\b(?:named|renamed|modeled|modelled|patterned|fashioned)\b[^.]*after ____/i;
/** Prompts whose blank wants a person. */
const PERSON_PROMPT = [
  /^Who(?:'s|se)?\b/i,
  /\bwho\b[^.?]*\?$/i,
  /\b(?:goes to|went to|awarded to|belongs to|married|marry|dating|date with|hired|fired|elected|best man|maid of honor|godfather|babysitter|sponsored by|hosted by|played by|voiced by|replaced by|starring|cast as|roommate|in bed with|woke up next to|wake up next to|lying next to|virginity to|a threesome with|threesome with|swiped right on|matched (?:me )?with|proposed to|engaged to|left me for|guest of honor was|body count includes|tell-all names)\s+____/i,
  /\bmy (?:new )?(?:boyfriend|girlfriend|husband|wife|partner|therapist|doctor|lawyer|dealer|roommate|sponsor) is ____/i,
  /____ (?:walks|walked|is|was|got|gets) (?:into|in|arrested|elected|fired|hired|pregnant)/i,
  /\bwants? to be ____|\bgrow(?:s)? up to be ____/i, // "My son wants to be ____ when he grows up."
  /\b(?:won|led|hosted|coached|taught|raised|narrated|officiated|catered) by ____|\b(?:spin-off|reboot|sequel|show|series|documentary) follows ____|\bimaginary friend (?:is|was) ____/i,
  /\b(?:mistress|lover|secret admirer|stalker|sugar daddy|sugar baby|new stepdad|new stepmom) (?:was|is) (?:actually |secretly |really )?____/i, // "The senator's mistress was actually ____."
  // "Disney's next princess is ____.", "The Bachelor's final rose went to ____."
  /\b(?:princess|prince|villain|hero|superhero|host|judge|contestant|headliner|bachelor|bachelorette|winner|champion|mvp|nominee|role model|spokesperson) (?:is|was|will be) ____/i,
];
/** Prompts whose blank is a name: a title, a nickname, a safe word, a line someone says. */
const NAME_PROMPT = [
  /["“]____|____\.?["”]|#____/, // a quoted blank ("The ____." too), a hashtag
  /^What(?:'s| is| was) [\w' -]*(?:name|nickname|handle|safe ?word|title|slogan|catchphrase|motto|password)\?/i, // "What's Trump's safe word?"
  /\b(?:called|titled|named|nicknamed)\?$/i, // 'the porn parody of "Frozen" called?'
  /^What did .* (?:say|whisper|shout|yell|scream|write|announce|text|sext|tweet|post|repeat)\b/i,
  /\bthing (?:I|you|he|she|they|we)(?:'ve|'d|'s)? (?:ever )?(?:said|yelled|texted|whispered|posted|tweeted)\b/i,
  /\b(?:thing|things) to (?:say|hear|whisper|shout|yell|scream)\b/i,
  /\b(?:keeps? announcing|keeps? saying|keeps? yelling) ____/i,
  /\b(?:named|nicknamed|titled|captioned|called) ____/i,
  /\b(?:porn name|stage name|drag name|nickname|safe ?word|handle|slogan|motto|title|password|catchphrase|wordle answer|first word|last words?) (?:is|was|were|will be) ____/i, // "My parents' Wi-Fi password is ____."
  /\b(?:says|reads|calls (?:me|him|her|it)|call (?:me|him|her|it)) ____|\bcalls? (?:me|him|her|it)\?$/i, // "...says ____", "What does the group chat call me?"
];

type BlackLike = Pick<BlackCard, 'text'> & { slot?: Slot; slots?: Slot[]; pick?: number };

/** The slot a black card's (first) blank wants; the card's own `slot` / `slots` win over the reading. */
export function slotOf(card: BlackLike): Slot {
  if (card.slots?.[0]) return card.slots[0];
  if (card.slot) return card.slot;
  const t = card.text;
  if (NAME_PROMPT.some((re) => re.test(t))) return 'name';
  if (PERSON_PROMPT.some((re) => re.test(t))) return 'person';
  if (!NAMED_AFTER.test(t) && DOING_PROMPT.some((re) => re.test(t))) return 'doing';
  return 'thing';
}

/** One slot per white card the prompt takes: `slots` from the card, else the first blank's for all. */
export function slotsOf(card: BlackLike): Slot[] {
  const pick = card.pick ?? 1;
  const first = slotOf(card);
  return Array.from({ length: pick }, (_, i) => card.slots?.[i] ?? first);
}

const NOT_GERUND =
  /^(thing|something|nothing|everything|anything|ring|king|wing|string|spring|bling|morning|evening|wedding|building|feeling|ceiling|pudding|stocking|clothing|sibling|darling|during)$/i;
const ADVERB =
  /^(not|quietly|slowly|loudly|secretly|aggressively|extremely|slightly|accidentally|finally|casually|barely|openly|silently|gently|violently|briefly|nearly|almost|never|always|just|still|only|really|very|too|softly|angrily|politely|deliberately|repeatedly|calmly|suddenly|passive)$/i;
const PERSON_WORD =
  /\b(?:man|woman|guy|girl|boy|kid|child|baby|mom|mother|dad|father|grandma|grandpa|grandmother|grandfather|uncle|aunt|cousin|nephew|niece|son|daughter|brother|sister|wife|husband|boyfriend|girlfriend|ex|priest|pastor|nun|rabbi|doctor|nurse|dentist|therapist|lawyer|cop|officer|teacher|coach|principal|boss|coworker|neighbor|roommate|stranger|clown|stripper|hooker|escort|dominatrix|plumber|mailman|pilot|senator|president|king|queen|prince|princess|pope|santa|jesus|god|satan|devil|ghost|robot|celebrity|star|actor|singer|rapper|influencer|streamer|twin|toddler|teen|teenager|virgin|widow|orphan|intern|barista|waiter|waitress|bartender|babysitter|landlord|dealer|pimp|nurse|surgeon|proctologist|gynecologist|monk|bishop|cardinal|soldier|marine|veteran|cowboy|farmer|trucker|biker|hitler|putin|trump|biden|obama|epstein|musk|kanye|oprah|beyonc[eé]|drake|bieber|swift|cage|keanu)s?\b/i;
/** Two-word events the first word alone would miss ("A bachelor party…", "A trust fall…"). */
const EVENT_PHRASE =
  /^(?:bachelor party|bachelorette party|trust fall|conga line|gender reveal|juice cleanse|group hug|keg ?stand|body shot|road trip|field trip|gift exchange|secret santa|pool party|block party|bake sale|garage sale|yard sale|open mic|talent show|spelling bee|science fair|book club|wine night|game night|date night|girls'? trip|guys'? trip|spring break|happy hour|last call|closing time|lunch break|smoke break|fire drill|trust exercise|team building|team-building|ice bath|cold plunge|hot yoga|silent disco|bar crawl|pub crawl|walk of|morning after|first date|blind date|one-night stand|family reunion|high school reunion|class reunion|company retreat|corporate retreat|church retreat|couples'? retreat|office party|holiday party|christmas party|dinner party|birthday party|surprise party|divorce party|baby shower|bridal shower|wedding night|wedding toast|best man's toast|father-daughter dance|slow dance|lap dance|mosh pit|bar fight|food fight|pillow fight|snowball fight|water balloon fight|prank war|water park|ski trip|camping trip|cruise ship|all-nighter|power nap|drunk text|butt dial|booty call|walk of shame|group project|group text|group chat|mass exodus|sit-in|hunger strike|jury duty|open house|home inspection|tax audit|drug test|drive-by|hit-and-run|car crash|fender bender|speed trap|sobriety test|perp walk|citizen's arrest|plea deal|parole hearing|custody hearing|will reading|open casket|viking funeral|pet funeral|clown funeral|mass grave)\b/i;

/** Two-word roles the first word alone would miss. */
const PERSON_PHRASE =
  /^(?:wine mom|mall santa|flower girl|best man|youth pastor|gym crush|one-night stand|florida man|sugar (?:daddy|baby|mama)|cam girl|pool boy|pizza guy|delivery guy|crossing guard|substitute teacher|school nurse|team doctor|parole officer|police officer|night-shift nurse|hit man|drunk uncle|creepy uncle|stage mom|soccer mom|dance mom|helicopter parent|gym teacher|lunch lady|bus driver|uber driver|lyft driver|cab driver|truck driver|flight attendant|tour guide|bar bathroom attendant|security guard|mall cop|dog walker|wedding planner|wedding dj|dental hygienist|party clown|birthday clown|drill sergeant|border agent|tsa agent|hr rep|customer service rep|reddit moderator|linkedin influencer|karen|chad|boomers?|crypto bro|tech bro|frat (?:boy|bro)|sorority girl|gamer girl|e-?girl|stunt double|body double|method actor|child star|porn star|rock star|drag queen|sex worker|sex robot|ai girlfriend)$/i;

/** A relative clause on the head is about someone: "A masseuse who goes too far.", "MySpace Tom,
 *  who saw everything." — but "A funeral for someone who's at the funeral." is a funeral, so the
 *  "who" must come within four words of the start. */
const WHO_CLAUSE =
  /^(?:A |An |The |My |Your |Our )?(?!.*\b(?:someone|somebody|anyone) who)(?:[\w'’-]+,? ){1,4}who\b/i;
/** What may follow the person word for it to be the head of the phrase. */
const LINK_AFTER =
  /^(?:with|who|whose|that|named|called|at|in|on|from|and|of|for|without|under|behind|during|after|before|as|to|dressed|covered|wearing|holding|doing|having|being|selling|giving|getting|taking|my|your|his|her|their|our|nobody|everyone|someone|you|we|they|i)$/i;
/** A card short enough to be a name, a safe word, a title: four words or fewer. */
export const NAME_MAX_WORDS = 4;
/** Nouns that name something that happens: a card headed by one reads as a doing too. */
const EVENT_WORD =
  /^(?:sex|anal|blowjob|handjob|footjob|threesome|orgy|gangbang|gang|quickie|hookup|fisting|rimming|creampie|bukkake|pegging|lap|road|murder|stabbing|shooting|hit-and-run|crash|dui|bender|breakup|affair|proposal|wedding|funeral|s[ée]ance|exorcism|baptism|colonoscopy|vasectomy|prostate|bake|potluck|party|shower|reunion|retreat|orgy|riot|brawl|fight|heist|robbery|arson|overdose|hangover|eviction|layoffs?|divorce|annulment|honeymoon|date|dinner|brunch|trip|vacation|sleepover|séance|ritual|sacrifice|ceremony|initiation|hazing|dare|bet|prank|accident|incident|scandal|walkover|walk|marathon|concert|show|parade|protest|strike|trial|hearing|deposition|confession|eulogy|toast|speech|sermon|audit|inspection|raid|abduction|kidnapping|ransom|massacre|apocalypse|rapture|birth|death|christening|bris|prom|graduation|recital|audition|interview|meeting|review|exam|surgery|transplant|autopsy|cremation|burial|wake|vigil|blackout|breakdown|meltdown|relapse|rehab|detox|fast|cleanse|diet|workout|yoga|massage|facial|wax|pedicure|manicure|tattoo|piercing|circumcision|abortion|miscarriage|pregnancy|labor|c-section|delivery|pickup|dropoff|carpool|commute|layover|flight|cruise|tour|safari|hike|camping|hunt|fishing|swim|dive|jump|fall|slip|spill|leak|flood|fire|explosion|earthquake|tornado|hurricane|blizzard|avalanche|eclipse|séance)$/i;

/** The slots a white card serves, its own kind first; the card's own `serves` wins over the reading. */
export function servesOf(card: Pick<WhiteCard, 'text'> & { serves?: Slot[] }): Slot[] {
  if (card.serves && card.serves.length > 0) return card.serves;
  const words = card.text
    .replace(/[^A-Za-z' ]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const short = words.length <= NAME_MAX_WORDS;
  const gerund = (w: string | undefined): boolean =>
    w !== undefined && /ing$/i.test(w) && !NOT_GERUND.test(w);
  let kind: Slot = 'thing';
  if (gerund(words[0]) || (ADVERB.test(words[0] ?? '') && gerund(words[1]))) kind = 'doing';
  else {
    // The head noun: "A nun with a strap-on." is a nun; "Grandma's corpse in the recliner." is a
    // corpse (a possessive head names the owner, not the card); "A clown car full of dildos." is a
    // car (the person word must end the noun phrase: a link word, a comma or the full stop after it).
    const rest = card.text.replace(/^(?:A |An |The |My |Your |Our )/, '');
    const [head = '', after = '', third = ''] = rest.split(/[ ,.]/);
    const possessive = /['’]s$|s['’]$/.test(head);
    const ends = after === '' || LINK_AFTER.test(after);
    // A two-word role ("wine mom", "mall Santa", "crossing guard") is the head when the phrase
    // ends after it — the first word alone would read "wine" as a thing.
    const pair = `${head} ${after}`;
    const pairEnds = third === '' || LINK_AFTER.test(third);
    if (
      (!possessive && ends && PERSON_WORD.test(head)) ||
      (pairEnds && PERSON_PHRASE.test(pair)) ||
      WHO_CLAUSE.test(card.text)
    )
      kind = 'person';
    // An event named as a noun ("A threesome with a mime.", "Anal in a canoe.") is a thing that
    // also reads as something that happened — the best answer to "…was ruined by ____".
    else if ((!possessive && ends && EVENT_WORD.test(head)) || EVENT_PHRASE.test(pair)) {
      const out: Slot[] = ['thing', 'doing'];
      return short ? [...out, 'name'] : out;
    }
  }
  return short ? [kind, 'name'] : [kind];
}

/** How well a card of each served slot reads in a blank of each wanted slot (0–1); `name` is only
 *  ever a second reading, so it adds nothing outside a name blank. */
const FIT: Readonly<Record<Slot, Readonly<Record<Slot, number>>>> = {
  thing: { thing: 1, doing: 0.7, person: 0.85, name: 0 },
  doing: { thing: 0.3, doing: 1, person: 0.25, name: 0 },
  person: { thing: 0.5, doing: 0.3, person: 1, name: 0 },
  name: { thing: 0.5, doing: 0.5, person: 0.5, name: 1 },
};

/** 0–1: the best reading the white card offers the black card's slot. With the card's text, a
 *  name blank grades by length instead of the four-word line: a slogan or a loading-screen tip
 *  takes six words happily, a safe word wants one, and a twelve-word card is a wall either way. */
export function fitScore(
  slot: Slot,
  serves: readonly Slot[],
  text?: string,
  blackText?: string,
): number {
  if (slot === 'name' && text !== undefined)
    return nameFit(text, blackText !== undefined && WORD_PROMPT.test(blackText));
  return Math.max(0, ...serves.map((s) => FIT[slot][s] ?? 0));
}

/** A name blank that wants a WORD — a safe word, a nickname, a handle, a password, a first
 *  word, a hurricane's name — lands hardest on one or two words; a title or a line takes six. */
const WORD_PROMPT =
  /\b(?:safe ?word|nickname|handle|password|first word|drag name|stage name|porn name|code ?word|call sign|username|gamer ?tag|named ____|was named|wi-?fi (?:network|password))\b/i;

/** How a card of this length reads as a name, a title, a line: 1 up to four words, then down —
 *  and for a blank that wants a word, 1 up to two. */
export function nameFit(text: string, word = false): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  if (word) {
    // Steep: the one-word cards are mostly filler-tier, and the tier weight must not carry a
    // six-word amazing card past "Smegma." as a safe word.
    if (words <= 2) return 1;
    if (words === 3) return 0.85;
    if (words === 4) return 0.6;
    if (words <= 6) return 0.3;
    return 0.15;
  }
  if (words <= NAME_MAX_WORDS) return 1;
  if (words <= 6) return 0.8;
  if (words <= 8) return 0.6;
  return 0.45;
}

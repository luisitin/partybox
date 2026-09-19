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
// share; `tier` (1 filler, 2 good, 3 great, 4 amazing — set on the card, default 2) is how good
// the card is on its own.
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
  /\b(?:resolutions?|bucket list|routine|to-do list|guilty pleasures?|hobby|hobbies|habits?)\b[^.?]*(?::| is| was| starts with| ends with) ____/i, // "New Year's resolution, abandoned by January 3rd: ____.", "The nun's guilty pleasure is ____."
  /\bdo (?:at|in|on|to|with|for|instead|before|after|during|while|when|all day|every)\b/i, // "What did Lincoln do at…", "…do while I'm at work?"
  /\b(?:was|is|were) actually (?:[A-Z][\w']+ ){1,3}____/, // "The moonwalk was actually Michael Jackson ____."
  /\b(?:does|did|caught (?:me|him|her|them|us|the \w+)|busy|instead of|after|before|while|during|until|in the middle of|conceived during|spent (?:the \w+|\w+ years?)|most likely to|made (?:me|us|them|him|her) do|performed|opened with|threw a flag for|flag for)\s+____/i,
  /["“]Most Likely To["”] was ____/i, // the yearbook's
  /\b(?:when|once|until|the (?:moment|second|minute)) ____[.!?]?$/i, // "The audit got personal when ____." (a clause: what someone did)
  /\b(?:best|worst|favou?rite|only|fastest|quickest) way to \w+/i, // "The best way to annoy a sibling: ____."
  // (No trailing \b: after "on?" the end of the text is no word boundary — "What did the kids walk
  // in on?" read as a thing for twenty passes.)
  /\b(?:what happened|what went wrong|walk(?:ed)? in on\?|catch (?:\w+ )+doing\b|am I doing\b|are you doing\b|^how did\b|^why\b)/i,
  /\b(?:pulled (?:me|us|him|her) over|pulled over|in trouble|grounded|detention|suspended|deported|excommunicated|disqualified|demonetized|cancel(?:l)?ed) (?:\w+ )?for ____/i,
  /\b(?:ruined|interrupted|cancelled|canceled|delayed|caused|started|ended|followed|triggered|brought on) by ____/i,
  /\b(?:led to|ended (?:\w+ )?(?:with|in)|started with|began with) ____\.?$/i,
  // "What got me banned…?", "What ended the marriage?", "the secret to a happy marriage", "the
  // CIA's new interrogation technique": what someone did, or does.
  /^What (?:got|ended|finally ended|killed|ruined|started|caused|broke up)\b/i,
  /\b(?:technique|trick(?!-or-)|secret to|real reason for|reason the [\w' ]+ ended|mistake (?:was|is)|biggest mistake|first mistake|mistake: ____|strategy (?:was|is)|plan (?:was|is)|never live down|live down|alibi\b[^.?]* (?:is|was|involves)|shalt not|practi[sc]e)\b/i,
  /\b(?:turned into|opens with|cuts to|closes with) ____/i, // "…trust exercise turned into ____", "The sex tape opens with ____"
  // "The Times Square Elmo was doing ____.", "…married us and then ____.", "…talked me into ____.",
  // "…got the part by ____." (loop 818).
  /\bdoing ____|\band then ____|\btalked (?:me|us|him|her|them) into ____|\b(?:part|job|role|gig|promotion|raise|scholarship|record deal|internship) by ____/i,
  /\b(?:confess(?:ed|ing)? to|admit(?:ted)? to|plead(?:ed)? guilty to|owned up to|apologi[sz]ed? for|blame[sd]? (?:me|him|her|them|us|you|it) for|forgive (?:me|him|her|them|us) for|guilty of)\b/i, // "What did I confess to on the witness stand?"
  /\b(?:done|did|loved|dare (?:was|is)|ritual (?:was|is)): ____|doing what \w+ loved/i,
  // "Game night's loser had to ____.": a verb wanted — a gerund is the nearest thing the decks hold.
  /\b(?:had to|has to|have to|forced (?:me|us|him|her|them) to|dared (?:me|us|him|her|them) to|made (?:me|us|him|her|them)|refused to|agreed to|threatened to|learned to|promised to|tried to|decided to|(?:ordered|told|asked) (?:me|us|him|her|them) to) ____/i,
  // "The heat wave had everyone ____.", "Snowed in for three days, we ____.", "Poutine was used
  // for ____.", "The Canadian's apology was for ____.", "What did the preacher confess?" (loop 831).
  /\b(?:had (?:everyone|everybody|us|me|them|the \w+)|, (?:we|I|they|he|she)|used for|apolog(?:y|ies|ized|ised) (?:was |is |were )?for) ____|\bconfess\?$/i,
  /\b(?:arrested|fired|executed|burned|shut down|raided|resigned|banned|expelled|sued|jailed|convicted|dumped|put (?:\w+ ){1,2}down|quit|walked out|kicked out|fined|voted off|kicked (?:me|us|him|her) off|upgraded (?:me|us)|comped (?:me|us)|congratulated (?:me|us|him|her)|lost the prize)\b[^.]* (?:for|over) ____/i,
  // "…will be remembered for ____", "…is famous for ____", "a ribbon for ____", "charges extra for ____".
  /\b(?:remembered|remember (?:me|us|him|her)|famous|only good|charge[sd]?(?: (?:me|us|extra|a cleaning fee))?|a (?:charge|ribbon|badge|medal|trophy|award|bonus|raise|promotion)|one break a day) for ____/i,
  // A ritual, a dare, an activity, a way to get something: what someone does.
  /\b(?:ritual|hazing|dare|tradition|activity|hobby|pastime|challenge|way to get|specializes in|known for|charged? extra for|signature move|finishing move|move in bed|new event: ____|as an event)\b/i,
];
/** "Renamed itself after ____", "modeled after ____": a thing, not an event after which. */
const NAMED_AFTER = /\b(?:named|renamed|modeled|modelled|patterned|fashioned)\b[^.]*after ____/i;
/** Prompts whose blank wants a person. */
const PERSON_PROMPT = [
  /^Who(?:'s|se)?\b/i,
  /\bwho\b[^.?]*\?$/i,
  /\b(?:goes to|(?<!budget |money |funds |fund |proceeds |profits |donations |prize |award |trophy |medal |scholarship |inheritance |Oscar |Grammy |Emmy )went to|awarded to|belongs to|married|marry|dating|date with|hired|fired|elected|best man|maid of honor|godfather|babysitter|sponsored by|hosted by|played by|voiced by|replaced by|starring|cast as|roommate|in bed with|woke up next to|wake up next to|lying next to|virginity to|a threesome with|threesome with|swiped right on|matched (?:me )?with|proposed to|engaged to|left me for|guest of honor was|body count includes|tell-all names)\s+____/i,
  /\bmy (?:new )?(?:boyfriend|girlfriend|husband|wife|partner|therapist|doctor|lawyer|dealer|roommate|sponsor) is ____/i,
  /____ (?:walks|walked|is|was|got|gets) (?:into|in|arrested|elected|fired|hired|pregnant)/i,
  /\bwants? to be ____|\bgrow(?:s)? up to be ____/i, // "My son wants to be ____ when he grows up."
  /\b(?:won|led|hosted|coached|taught|raised|narrated|officiated|catered|written|directed|designed|invented|founded|painted|composed|sung|performed|delivered|approved|signed|endorsed) by ____|\b(?:spin-off|reboot|sequel|show|series|documentary) follows ____|\bimaginary friend (?:is|was) ____/i,
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
  /\b(?:porn name|stage name|drag name|(?:real|full|middle|last|first|legal|birth|maiden|street|pen|code|user|Christian) name|nickname|safe ?word|handle|slogan|motto|title|password|catchphrase|wordle answer|first word|last words?) (?:is|was|were|will be) ____/i, // "My parents' Wi-Fi password is ____."
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
/** The first half of a two-word verb — "Dry humping", "Skinny dipping", "Parallel parking", "Tea
 *  bagging" — which the gerund test on the first word alone read as a thing (loop 786). */
const COMPOUND_VERB =
  /^(?:dry|skinny|day|line|tea|tap|parallel|extreme|ice|foam|team|quiet|drunk|ass|anal|speed|binge|power|deep|slow|dumpster|butt|dirty|pole|lap|belly|hate|rage|doom|stress|sleep|free|hand|rock|kite|sky|bungee|scuba|bar|face|toe|nut|dog|cat|glory|dick|body|window|couch|table|floor|wall|corpse|grave|bible|church|hair|nose|mouth|cross|street|hot|cold|wet|sad|angry|late|early|double|triple|half|over|under|micro|macro|mass|group|solo|public|private|online|remote|virtual|manual|reverse|forward|backward|upside|inside|outside|sword|knife|gun|axe|rope|chain|whip|belt|glass|bottle|can|cup|spoon|fork|plate|bowl|pan|pot|oven|stove|grill|dish|clothes|shoe|sock|hat|pants|shirt|tie|wig|mask)$/i;
/** A gerund that is the first half of a noun: "breaking news", "parking lot", "sleeping bag". */
const GERUND_NOUN =
  /^(?:breaking news|living room|parking (?:lot|ticket|garage|spot|space)|swimming pool|sleeping bag|washing machine|frying pan|running shoes|dining room|shopping (?:cart|mall|list)|boxing day|driving (?:test|range)|drinking (?:game|fountain|problem)|dating (?:app|profile|show)|wrapping paper|reading glasses|waiting room|walking (?:stick|dead)|rolling pin|cooking show|bowling (?:alley|ball)|training (?:wheels|montage)|landing strip|dressing room|cutting board|hunting (?:season|lodge)|tanning bed|vending machine|sewing machine|fitting room|talking (?:points|stage)|wishing well|whipping cream|rocking chair|folding chair|opening night|closing time|standing desk|spinning class|bathing suit|baking soda|chewing gum|shaving cream|hearing aid|wedding (?:night|ring|dress|cake)|morning (?:wood|sickness|after)|evening (?:news|gown))$/i;
const ADVERB =
  /^(not|quietly|slowly|loudly|secretly|aggressively|extremely|slightly|accidentally|finally|casually|barely|openly|silently|gently|violently|briefly|nearly|almost|never|always|just|still|only|really|very|too|softly|angrily|politely|deliberately|repeatedly|calmly|suddenly|passive)$/i;
const PERSON_WORD =
  /\b(?:man|woman|guy|girl|boy|kid|child|baby|mom|mother|dad|father|grandma|grandpa|grandmother|grandfather|uncle|aunt|cousin|nephew|niece|son|daughter|brother|sister|wife|husband|boyfriend|girlfriend|ex|priest|pastor|nun|rabbi|doctor|nurse|dentist|therapist|lawyer|cop|officer|teacher|coach|principal|boss|coworker|neighbor|roommate|stranger|clown|stripper|hooker|escort|dominatrix|plumber|mailman|pilot|senator|president|king|queen|prince|princess|pope|santa|jesus|god|satan|devil|ghost|robot|celebrity|star|actor|singer|rapper|influencer|streamer|twin|toddler|teen|teenager|virgin|widow|orphan|intern|barista|waiter|waitress|bartender|babysitter|landlord|dealer|pimp|nurse|surgeon|proctologist|gynecologist|monk|bishop|cardinal|soldier|marine|veteran|cowboy|farmer|trucker|biker|hitler|putin|trump|biden|obama|epstein|musk|kanye|oprah|beyonc[eé]|drake|bieber|swift|cage|keanu)s?\b/i;
/** Two-word events the first word alone would miss ("A bachelor party…", "A trust fall…"). */
const EVENT_PHRASE =
  /^(?:bachelor party|bachelorette party|trust fall|conga line|gender reveal|juice cleanse|group hug|keg ?stand|body shot|road trip|field trip|gift exchange|secret santa|pool party|block party|bake sale|garage sale|yard sale|open mic|talent show|spelling bee|science fair|book club|wine night|game night|date night|girls'? trip|guys'? trip|spring break|happy hour|last call|closing time|lunch break|smoke break|fire drill|trust exercise|team building|team-building|ice bath|cold plunge|hot yoga|silent disco|bar crawl|pub crawl|walk of|morning after|first date|blind date|one-night stand|family reunion|high school reunion|class reunion|company retreat|corporate retreat|church retreat|couples'? retreat|office party|holiday party|christmas party|dinner party|birthday party|surprise party|divorce party|baby shower|bridal shower|wedding night|wedding toast|best man's toast|father-daughter dance|slow dance|lap dance|mosh pit|bar fight|food fight|pillow fight|snowball fight|water balloon fight|prank war|water park|ski trip|camping trip|cruise ship|all-nighter|power nap|drunk text|butt dial|booty call|walk of shame|group project|mass exodus|sit-in|hunger strike|jury duty|open house|home inspection|tax audit|drug test|drive-by|hit-and-run|car crash|fender bender|speed trap|sobriety test|perp walk|citizen's arrest|plea deal|parole hearing|custody hearing|will reading|open casket|viking funeral|pet funeral|clown funeral|mass grave)\b/i;

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
  // "Breaking news: your nudes." is news, not breaking; "Living room" a room (loop 809).
  const noun = GERUND_NOUN.test(`${words[0] ?? ''} ${words[1] ?? ''}`);
  if (
    (!noun && gerund(words[0])) ||
    ((ADVERB.test(words[0] ?? '') || COMPOUND_VERB.test(words[0] ?? '')) && gerund(words[1]))
  )
    kind = 'doing';
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
    // "Someone's dad on Grindr.", "Cheryl's husband." (loop 784), "A hot nun.", "The horniest man
    // in a Cabela's.", "A masturbating monk." (loop 816): a person word after one modifier — an
    // owner, an adjective — is the head when the phrase ends after it; "Grandma's dominatrix
    // career." is a career, "Mom's boyfriend's Camaro." a Camaro, "A Florida Man headline." a headline.
    const owned = pairEnds && !/['’]s$|s['’]$/.test(after) && PERSON_WORD.test(after);
    if (
      (!possessive && ends && PERSON_WORD.test(head)) ||
      owned ||
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
    return nameFit(
      text,
      blackText === undefined
        ? 'name'
        : WORD_PROMPT.test(blackText)
          ? 'word'
          : LINE_PROMPT.test(blackText)
            ? 'line'
            : 'name',
    );
  const best = Math.max(0, ...serves.map((s) => FIT[slot][s] ?? 0));
  // "My uncle's garage is full of ____" wants a plural or a mass noun: "A crop circle shaped like
  // a bagel" reads a beat off, "Cum-stained love letters" and "The wet spot" land (loop 758).
  if (
    slot === 'thing' &&
    text !== undefined &&
    blackText !== undefined &&
    MASS_PROMPT.test(blackText) &&
    /^(?:A|An) /.test(text)
  )
    return best * ONE_OF_MANY;
  // "The Ring doorbell caught the neighbor ____" wants a verb: an event noun serves a doing blank
  // after "for" or "after" ("arrested for A Labor Day gangbang") but not straight after its
  // subject ("caught the neighbor A Labor Day gangbang"), where only a gerund reads (loop 762).
  if (
    slot === 'doing' &&
    blackText !== undefined &&
    serves[0] !== 'doing' &&
    serves.includes('doing') &&
    GERUND_PROMPT.test(blackText)
  )
    return best * EVENT_AFTER_SUBJECT;
  return best;
}

/** A doing blank right after its subject — a pronoun, "the neighbor", a name, "busy" — where
 *  the card is the verb of the sentence. (Checked only once the blank is known to be a doing.) */
const GERUND_PROMPT =
  /\b(?:me|him|her|them|us|you|busy|the \w+|my \w+|(?!The\b|An?\b|Was\b|Is\b)[A-Z][\w']+) ____/;
/** What an event noun ("A bachelor party") keeps of its doing fit there. */
const EVENT_AFTER_SUBJECT = 0.6;

/** Blanks that want a quantity — a plural, a mass noun — rather than one thing with an article. */
const MASS_PROMPT =
  /\b(?:full of|made (?:entirely |mostly )?of|covered in|mostly|out of everything but|a side of|stuffed with|filled with|packed with|a bag of|a box of|a pile of|a drawer full of|plenty of|lots of|enough) ____/i;
/** What a one-of-something card keeps of its fit in such a blank. */
const ONE_OF_MANY = 0.85;

/** A name blank that wants a WORD — a safe word, a nickname, a handle, a password, a first
 *  word, a hurricane's name — lands hardest on one or two words; a title or a line takes six. */
const WORD_PROMPT =
  /\b(?:safe ?word|nickname|handle|password|first word|drag name|stage name|porn name|code ?word|call sign|username|gamer ?tag|named ____|was named|wi-?fi (?:network|password)|in (?:one|two|three) words|one word)\b/i;

/** A name blank that is a LINE — a title, a chapter, a headline, a slogan, a status, a toast, a
 *  review, a tweet: something said or written — where a whole sentence of a card is the joke
 *  ('The child star's memoir chapter 3: "A CT scan that found the missing ring, and the missing
 *  person."'); the seed-2024 read had six one-word cards up for it (loop 776). */
const LINE_PROMPT =
  /\b(?:memoir|chapter|title|titled|headline|slogan|tagline|motto|catchphrase|review|status|tweet|tweeted|post|posted|caption|captioned|toast|eulogy|vows?|speech|sermon|horoscope|fortune cookie|plaque|sign (?:reads|says|said)|reads ["“]|says ["“]|said ["“]|wrote ["“]|message|voicemail|text(?:ed)? ["“]|epitaph|tombstone|billboard|bumper sticker|last words|opening line|pickup line|first line|book|song|album|episode|movie|film|show|podcast|sequel|autobiography|biography|thesis|essay|manifesto|say|said|says|saying|yell|yelled|shout|shouted|whisper|whispered|hear|heard|announce|announced|announcing|write|wrote|written|repeat|repeated|sext|sexted|texted|words were|advice|mission statement|tip was|yearbook quote|confession|described|describes|quote|line was|report card|diary|notes|tab|birthday card|text|banner)\b/i;

/** How a card of this length reads as a name, a title, a line: 1 up to four words, then down —
 *  for a blank that wants a word, 1 up to two — and for a line, 1 up to eight. */
export function nameFit(text: string, mode: 'name' | 'word' | 'line' = 'name'): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  if (mode === 'line') {
    if (words <= 8) return 1;
    if (words <= 11) return 0.85;
    return 0.7;
  }
  if (mode === 'word') {
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

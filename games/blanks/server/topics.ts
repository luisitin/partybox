// What a card is about (loop 469): a handful of topics read off the text with word lists, so a
// bot can prefer a card that lands on the prompt's subject from a different angle — 'What's the
// new flavor of lube?' with "Hot sauce as lube." is a hit; with "A priest's browser history." it
// is a shrug — and avoid the card that merely repeats the prompt's own word ("What did the priest
// keep under the altar? A priest's browser history."). `pairBonus` is the small nudge the bot's
// appeal score takes; the fit model (fit.ts) still decides what kind of card the blank wants.
export const TOPICS = [
  'church',
  'death',
  'sex',
  'gross',
  'drugs',
  'family',
  'wedding',
  'work',
  'medical',
  'history',
  'venue',
  'tech',
  'holiday',
  'school',
  'animals',
  'food',
] as const;
export type Topic = (typeof TOPICS)[number];

const TOPIC_WORDS: Readonly<Record<Topic, RegExp>> = {
  church:
    /\b(?:church|priest|pastor|nuns?|bible|communion|confession(?:al)?|vatican|pope|god|jesus|satan|devil|hell|holy|baptis\w*|rabbi|monks?|bishop|cult|sins?|sinning|pray\w*|christ|rosary|s[ée]ance|exorcis\w*|demons?|ghosts?|haunted|cursed|rapture|antichrist|megachurch|televangelist|choir|indulgences|altar|chapel|minister|sermon|youth pastor)\b/i,
  death:
    /\b(?:funeral|corpse|coroner|hearse|casket|coffin|graves?|dying|died|dead|death|murder\w*|kill\w*|bod(?:y|ies)|morgue|wake|cremat\w*|ashes|autopsy|stab\w*|shot|poison\w*|serial killer|victims?|crime scene|shallow grave|buried|bury\w*|eulogy|cemetery|obituary|hit man|hitman|decapitat\w*|drown\w*|choking|ransom|kidnap\w*|snuff|remains|skulls?|embalm\w*|mass grave|lynch\w*|gallows|arson\w*|executed)\b/i,
  sex: /\b(?:dicks?|cocks?|dildos?|anal|blowjobs?|handjobs?|fuck\w*|cum\w*|jerk\w*|org(?:y|ies)|vibrators?|strap-on|butt plugs?|glory ?holes?|porn\w*|sex\w*|kinks?|fetish\w*|dominatrix|escorts?|strippers?|strip club|onlyfans|threesomes?|gangbangs?|gang bang|swingers?|nudes?|boners?|erection|fisting|rimming|pegging|pegged|queef\w*|vagina|pussy|tits?|titty|nipples?|balls|semen|jizz|lube|condoms?|virginity|hookups?|safe ?word|dungeon|creampie|bukkake|blumpkin|masturbat\w*|fleshlight|foreplay|missionary|edging|squirting|hooker|brothel|lap dance|gimp|leather|latex|horny|sluttiest|kama sutra)\b/i,
  gross:
    /\b(?:shit\w*|poop\w*|diarrhea|shart\w*|farts?|farting|piss\w*|pee\w*|puk\w*|vomit\w*|pus|scabs?|smegma|tampons?|toilet|turds?|snot|boogers?|maggots?|lice|rash|stds?|herpes|yeast|hemorrhoid|colonoscopy|prostate|urine|blood|bleeding|abscess|cyst|wart|fungus|sweat\w*|litter box|colostomy|placenta|bong water|mold\w*|pubes?|pubic)\b/i,
  drugs:
    /\b(?:cocaine|coke|meth|heroin|drunk|weed|acid|lsd|molly|ketamine|adderall|bong|crack|whippets?|absinthe|tequila|vodka|bender|dui|high|pills|mushrooms|nyquil|beer|wine|booze|shots|hangover|blackout|blacking out|overdos\w*|dealer|joint|fentanyl|ambien|edibles?|mouthwash|hand sanitizer|gasoline|plasma|open bar|bar)\b/i,
  family:
    /\b(?:grandma|grandpa|grandmother|grandfather|mom|dad|mother|father|uncle|aunt|cousin|family|reunion|in-laws?|mother-in-law|sister|brother|stepdad|stepmom|parents|firstborn|nephew|niece|roommate|neighbors?|hoa|cul-de-sac)\b/i,
  wedding:
    /\b(?:wedding|honeymoon|marriage|married|marry|bride|groom|bachelor|bachelorette|prenup|divorce|anniversary|proposal|ring|vows|officiant|best man|bridesmaid|groomsman|flower girl|ex|exes|dates?|dating|tinder|grindr|hinge|profile|swipe\w*|booty call|one-night stand|affair|cheating|husband|wife|couples?|valentine\w*|breakup|matched|registry|toast)\b/i,
  work: /\b(?:office|boss|hr|job|interview|coworkers?|ceo|interns?|layoffs|payroll|performance review|meeting|zoom|conference room|company|retirement|severance|linkedin|spreadsheet|powerpoint|copier|supply closet|whistleblower|shredder|night shift|potluck|christmas party|promotion|raise|employee|customers?|yelp|review|punch card|loyalty|groupon|coupon|venmo|bitcoin|401k|taxes|tax|accountant|lawyer|jury|court|deposition|evidence|restraining order|parole|prison|cellmate|cop|police|arrested|mugshot|bail|alibi|witness)\b/i,
  medical:
    /\b(?:doctors?|nurses?|dentists?|proctologist|gynecologist|hospital|surgeon|clinic|therapist|vasectomy|colonoscopy|paramedics?|ambulance|urologist|chiropractor|pharmacy|patients?|exam|viagra|hospice|gurney|flashlight|anesthesiologist|sponge count|ct scan|transplant|kidney|organs?|plasma|pregnancy test|paternity|dna test|fertility|abortion\w*|rehab|insulin|vaccine|lab|clinical trial|sleep apnea|ivf|iv bag)\b/i,
  history:
    /\b(?:hitler|stalin|putin|trump|biden|obama|epstein|nazis?|holocaust|9\/11|titanic|chernobyl|lincoln|napoleon|kim jong un|mussolini|watergate|nixon|pearl harbor|roman|romans|vikings?|salem|columbus|washington|kanye|musk|bezos|zuckerberg|oprah|swift|kardashians?|cold war|fauci|senators?|president|hindenburg|cleopatra|jack the ripper|marie antoinette|shakespeare|beethoven|mozart|einstein|van gogh|mona lisa|pompeii|rasputin|anne frank|black death|prohibition|dr\. phil|michael jackson|hillary|kamala|north korea|germany|australia|canada|guant[aá]namo|oppenheimer|mr\. rogers|elmo|bluey|batman|spider-man|fortnite|minecraft|hogwarts|wordle|duolingo|reddit|wikipedia|myspace|chatgpt|snl|the bachelor|survivor|price is right|friends|pixar|pornhub|joe rogan|weather channel|jfk|marilyn monroe|tiger woods|eras tour|nuremberg)\b/i,
  venue:
    /\b(?:waffle house|cracker barrel|denny'?s|chili'?s|applebee'?s|olive garden|arby'?s|golden corral|costco|walmart|ikea|home depot|dmv|target|chuck e\. cheese|cheesecake factory|kfc|starbucks|motels?|hotels?|airbnb|cruise|airport|tsa|flight|plane|airplane|gas station|truck stop|rest stop|parking (?:lot|garage)|porta[- ]?potty|dave & buster'?s|buffalo wild wings|hooters|spencer'?s|cabela'?s|wendy'?s|coachella|disneyland|renaissance fair|county fair|state fair|water park|water ?slide|pool|hot tub|jacuzzi|sauna|gym|mall|nursing home|retirement home|assisted-living|strip mall|drive-thru|elevator|basement|attic|garage|shed|crawl space|trunk|back seat|backseat|minivan|honda civic|ford focus|tesla|segway|zamboni|canoe|jet ski|ski lift|hot air balloon|trampoline|bouncy castle|corn maze|hayride|pumpkin patch|lookout|drive-in|dumpster|bathroom|stall|shower)\b/i,
  tech: /\b(?:roomba|alexa|siri|zoom|ring doorbell|doorbell|smart speaker|robots?|ai|chatgpt|apps?|bluetooth|spotify|peloton|airpods|apple watch|apple store|browser|incognito|group (?:chat|text)|venmo|doordash|livestream\w*|wi-?fi|drones?|satellite|autocorrect|deepfake|algorithm|screen share|facetime|podcast|webcam|cam girl|nokia|flip phone|dial-up|morse code|sexting|sext|texts?|phone|laptop|tablet|amazon|craigslist|facebook|zillow|audiobook|fitness tracker|notification|burner|passwords?|search history|newsletter|manifesto|vending machine|smart fridge|baby monitor|ring light|telescope|probe|rocket|space station|mars|moon landing|ufo|alien|astronaut|mission control)\b/i,
  holiday:
    /\b(?:thanksgiving|christmas|halloween|easter|new year'?s?|fourth of july|4th of july|valentine'?s?|labor day|santa|birthday|black friday|secret santa|elf on the shelf|fireworks|costume|gender reveal|baby shower|super bowl|halftime)\b/i,
  school:
    /\b(?:school|teacher|class|substitute|pta|field trip|school bus|kids?|toddlers?|bab(?:y|ies)|child\w*|little league|scouts?|camp|daycare|yearbook|prom|frat\w*|hazing|college|dorm|report card|extra credit|sex ed|homework|principal|coach|mascot|talent show|class pet|art teacher|counselor|choir boy|sunday school|jury duty)\b/i,
  animals:
    /\b(?:dogs?|cats?|raccoons?|goats?|horses?|camels?|parrots?|goose|bears?|monkeys?|pigs?|tigers?|squirrels?|koi|fish|rats?|snakes?|sheep|donkeys?|ants|hamster|chimp|kangaroo|mice|goldfish|tapeworm|maggots|lice|crabs|owl|pony|scarecrow|bird)\b/i,
  food: /\b(?:lube|flavor|taste\w*|guacamole|pizza|taco|churro|corn dog|hot dog|turkey|cake|cookies?|pie|gravy|mayonnaise|peanut butter|honey|whipped cream|hot sauce|ranch|cereal|soup|lasagna|mashed potatoes|banana|watermelon|cucumber|pumpkin|doritos|pringles|pop rocks|slurpee|gatorade|coffee|creamer|brunch|buffet|dinner|lunch|breakfast|potluck|meat|cheese|popcorn|crab legs|onion rings|bacon|charcuterie|tasting menu|menu|craft services|casserole|snacks|candy|chocolate|roses|kool-aid|absinthe|mouthwash|communion wine|wine)\b/i,
};

/** The topics a card touches. */
export function topicsOf(text: string): Topic[] {
  return TOPICS.filter((t) => TOPIC_WORDS[t].test(text));
}

const STOP = new Set(
  'a an the my your our his her their of in at on with for to and that who from by is it its was were what did does do i you we they this those these there here not no but or so as be been being have has had he she them us me one all any some very just only more most into over under after before about than then when where which whose while up out off down again ever never s t'.split(
    ' ',
  ),
);

/** A card's own words (lower-case, stems trimmed of a plural / possessive s), the stop words out. */
export function keywordsOf(text: string): Set<string> {
  const out = new Set<string>();
  for (const raw of text.toLowerCase().match(/[a-z0-9']+/g) ?? []) {
    const w = raw.replace(/'s$|s'$|'$/, '').replace(/s$/, '');
    if (w.length > 2 && !STOP.has(w)) out.add(w);
  }
  return out;
}

/** The bot's nudge for a pair: a shared topic said with different words is a hit (+), the prompt's
 *  own word coming back is a shrug (−), anything else is neutral. */
export const TOPIC_HIT = 0.12;
export const WORD_ECHO = -0.15;

/** A blank that wants a substance: "laced with ____", "the new flavor of", "smells like ____",
 *  "covered in ____", "oozing", "leaking" — food, gross and drug cards land there. */
const SUBSTANCE_PROMPT =
  /\b(?:laced with|flavou?r|smells? like|tastes? like|covered in|soaked in|full of|oozing|leaking|dripping|stuffed with|served with|side of|filled with|made of|ingredient|recipe|sauce|topping|scent)\b/i;
const SUBSTANCE_TOPICS: readonly Topic[] = ['food', 'gross', 'drugs'];

export function pairBonus(blackText: string, whiteText: string): number {
  const bw = keywordsOf(blackText);
  for (const w of keywordsOf(whiteText)) if (bw.has(w)) return WORD_ECHO;
  const wt = topicsOf(whiteText);
  if (SUBSTANCE_PROMPT.test(blackText) && wt.some((t) => SUBSTANCE_TOPICS.includes(t)))
    return TOPIC_HIT;
  const bt = new Set(topicsOf(blackText));
  return wt.some((t) => bt.has(t)) ? TOPIC_HIT : 0;
}

/** How a card lands on its own, read off its shape (loop 479): a twist after a comma ("…, but
 *  it's a coffin", "…, again", "…, hers") and a specific — a proper noun, a number, a brand —
 *  punch harder; a card that runs long reads slower on the TV. A small nudge, like the topic one. */
export function punch(text: string): number {
  let score = 0;
  if (
    /, (?:but|and|again|or|hers|his|unedited|literally|allegedly|ranked|sold|kept|fully|technically|finally|permanently|slowly|badly|participatory)\b/i.test(
      text,
    )
  )
    score += 0.08;
  else if (/,/.test(text)) score += 0.04;
  if (/\b[A-Z][a-z]+(?:'s)?\b(?!\.$)/.test(text.slice(1)) || /\d/.test(text)) score += 0.04;
  const words = text.split(/\s+/).length;
  if (words > 10) score -= 0.06;
  return score;
}

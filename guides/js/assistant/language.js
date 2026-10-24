import { normalize, possessive, tokens } from './retrieval.js';

// English question interpretation for the local guide assistants.
//
// This is a bounded rule-based reader, not a language model. It separates a
// message into conversational acts, at most three subquestions, each with a
// requested relationship, an optional subject phrase and its restrictions.
// Harmless request framing ("any idea", "can you point me towards") is
// removed; negation, quantities, editions, places and qualifiers never are.

export const MAX_PARTS = 3;

// Request framing that carries no restriction. Removed before intent
// detection and before material-term checks.
const FRAMES = [
    'hi there', 'hello there', 'hey there', 'hi', 'hello', 'hey', 'greetings',
    'thanks in advance', 'thank you', 'thanks', 'thx', 'cheers', 'please', 'pls', 'kindly',
    'any idea', 'any ideas', 'no idea', 'do you know', 'do you happen to know', 'happen to know',
    'would you happen to know', 'does anyone know', 'i was wondering', "i'm wondering", 'i am wondering',
    'i wonder', 'just wondering', 'wondering', 'quick question', 'real quick', 'by any chance',
    'if you know', 'if possible', 'if you can', 'can you tell me', 'could you tell me', 'would you tell me',
    'can you let me know', 'let me know', 'can you show me', 'could you show me', 'show me',
    'i want to know', 'i wanna know', "i'd like to know", 'i would like to know', 'i need to know',
    'i want to find out', 'i need to find out', 'remind me', 'help me', 'can you help me', 'could you help me',
    'can you', 'could you', 'would you', 'will you', 'can u', 'could u',
    'tell me more', 'anything else', 'more please', 'go on', 'and more', 'i mean', 'in the game', 'in this game', 'by the way', 'btw', 'um', 'uh', 'umm', 'ok so', 'okay so', 'so',
    'ok', 'okay', 'alright', 'just', 'basically', 'exactly', 'again', 'anyway', 'anyways',
    'yo', 'lol', 'lmao', 'lmfao', 'haha', 'hahaha', 'hehe', 'heh', 'plz', 'plzz', 'dude', 'bro', 'omg', 'hmm', 'ty', 'thank u'
];
// "tell me about X" asks for a description; plain "tell me" is framing.
const FRAME_RE = new RegExp(`(?:^|\\s)(?:tell me(?! about)|${FRAMES.map(escape).sort((a, b) => b.length - a.length).join('|')})(?=\\s|$|[,;:.!?])`, 'g');

// Action cues identify a relationship; after detection they are not material.
const CUES = [
    'get my hands on', 'get your hands on', 'lay my hands on', 'lay hands on', 'get hold of', 'get ahold of',
    'point me in the direction of', 'point me towards', 'point me toward', 'point me to', 'point me at',
    'looking for', 'searching for', 'search for', 'trying to find', 'try to find', 'track down', 'come across',
    'pick up', 'set up', 'setting up', 'deal with', 'take down', 'take out', 'what do i need', 'what i need',
    'how much', 'get to', 'getting to', 'travel to', 'go to', 'head to', 'route to', 'path to',
    "i can't find", 'i cannot find', "i can't get", 'i cannot get', "i can't figure out", "i don't know how to", "i don't know where", 'i keep dying to', 'keeps killing me', 'keep killing me', 'keeps beating me', "i'm stuck on", 'i am stuck on', "can't leave", 'cannot leave', "it can't", 'it cannot', "it won't", "it doesn't", "doesn't work", 'does not work', "won't work", 'not working', "isn't working", "won't start", "won't launch", "can't start", "can't launch", 'my party', 'our party', "can't escape", "can't exit", "can't get out of", "i'm stuck at", 'i am stuck at', "i'm stuck and", 'i am stuck and',
    'tell me about', 'what kind of', 'good for', 'used for', 'is for', 'are for', 'for what'
];
const CUE_RE = new RegExp(`(?:^|\\s)(?:${CUES.map(escape).sort((a, b) => b.length - a.length).join('|')})(?=\\s|$)`, 'g');

// Single words that never restrict a fact: articles, pronouns, auxiliaries,
// question words and the vocabulary used to ask for each relationship.
// Negation, quantities, comparison, time and place words are deliberately absent.
export const SCAFFOLD = new Set((
    'a an the some any i me my mine myself you your yours we us our it its itself that this these those ' +
    'he him his she her they them their there here one thing things item stuff ' +
    'is are was were be been being am do does did done doing can could should would will shall may might must ought ' +
    'maybe perhaps possibly way ways ' +
    'have has had having get gets getting got gotten ' +
    "where's what's who's how's that's there's it's i'm i've i'd i'll you're let's whats wheres hows " +
    'where what who whom whose why when which how ' +
    'of to for in at on with from about into onto by as and or so then also too against ' +
    'go goes went lead leads take takes make happens happen gets if whenever open opening enable enabling toggle turn grant grants provide provides offer offers bonus bonuses threat level danger dangerous gives giver fix fixing repair troubleshoot resolve waking awaken attribute attributes strong powerful strength dexterity intelligence caps cap talent ' +
    'hi hello hey thanks thank ok okay yeah yes yep sorry well just really exactly again actually anyway ' +
    'tell say show give gives given let know wonder wondering idea help need needed want wanted like ask try trying talk talking speak speaking ' +
    'location located locate find finding found spot whereabouts coordinates coordinate position point towards toward direction look looking see seeing seen visit visiting ' +
    'search searching track come across reach travel go going head route path live lives spawn spawns appear appears roam roams ' +
    'keeps keep keeping ' +
    'deleting deleted deletes blocking blocked blocks quarantine quarantined quarantining crash crashes crashed crashing freeze freezes freezing frozen fail fails failed failing error errors broken ' +
    'range radius duration far wide farm farming grind grinding boost boosting increase increasing hide hiding conceal smuggle smuggling class circle race school rank town learn learning learned learns teach teaches taught who makes made crafts crafted forged ' +
    'obtain obtaining acquire acquiring buy buying purchase sells sold cost costs price much shop merchant vendor ' +
    'recruit recruiting recruited join joins joining hire hiring download downloading pick picking grab hold ahold hands lay ' +
    'earn receive gain obtained acquired bought purchasing locating ' +
    'use uses used using usage effect effects work works function purpose good equip activate cast install ' +
    'installation installing setup set setting up configure configuring configuration stats stat statistics damage ability abilities ' +
    'equipping activating casting ' +
    'fight fighting fought beat beating beaten defeat defeating defeated kill killing killed battle battling combat weakness weaknesses weak destroy destroying banish banishing ' +
    'vulnerable vulnerability tactic tactics strategy strategies deal take taking took down out counter ' +
    'prerequisite prerequisites requirement requirements require required requires enter access allowed ' +
    'explain describe description info information detail details lore background mean meant meaning role kind ' +
    'hint hints clue clues nudge next stuck proceed progress walkthrough tip tips advice guide finish complete solve now pass passing passed tackle tackling handle handling begin beginning approach ' +
    'counter countering cure cures cured curing remove removing rid prevent preventing protect protection resist resisting ' +
    'resistance immune immunity recover recovery undo revive resurrect resurrected raise bring back antidote stop snap ' +
    'wake treat treatment being become becomes past through around bypass sneak survive escape solve ' +
    'pros cons advantage advantages disadvantage disadvantages compare comparison versus vs difference recommend ' +
    'option options choose choice prefer sell selling worth invite keep let ' +
    'version edition patch release build').split(/\s+/).filter(Boolean));
// Ranking words are relationship vocabulary only in a comparison question.
export const COMPARISON_WORDS = new Set('better worse best worst prefer preferable'.split(' '));

// Conditions a character can be in. "X got poisoned" describes a problem,
// never a request to acquire something.
const CONDITIONS = String.raw`possessed|charmed|poisoned|paralyzed|paralysed|cursed|asleep|blinded|blind|sick|ill|diseased|dead|killed|mind-controlled|controlled|insane|mad|intoxicated|drunk`;

// "Who can join my party?", "What spells are there?": a request for the guide's own list of one kind of entry.
const LIST_GROUPS = [
    ['companions', /(?:companions?|party members?|recruits?|followers?|allies|characters?|people|heroes)/],
    ['spells', /(?:spells?|magic spells?|incantations?)/],
    ['items', /(?:items?|equipment|weapons?|armou?rs?|gear)/],
    ['creatures', /(?:monsters?|enemies|creatures?|bestiary|foes)/],
    ['virtues', /virtues?/], ['shrines', /shrines?/], ['reagents', /reagents?/], ['shards', /shards?/],
    ['chapters', /chapters?/], ['shops', /(?:shops?|stores?)/],
    ['moves', /(?:(?:sword )?(?:swings?|moves?|attacks?|strikes?)|combat moves)/], ['cheats', /cheats?/]
];
const LIST_NOUN = `(?:${LIST_GROUPS.map(([, re]) => re.source).join('|')})`;
const LIST_FILL = String.raw`(?:(?:the|all|all the|all of the|my|our|some|any|available|possible|different|main|known|playable|recruitable|every|in this game|in the game|in this guide) )*`;
const LIST_RE = new RegExp(String.raw`^(?:(?:what|which|who)(?: are| is| were)? ${LIST_FILL}${LIST_NOUN}(?: are there| exist| do (?:i|you|we) have| can i (?:get|recruit|join|find|learn|use|add)| are available| are in (?:this|the) (?:game|guide)| are there in (?:this|the) (?:game|guide))?` +
    String.raw`|(?:list|name|enumerate)(?: me)? ${LIST_FILL}(?:of )?${LIST_FILL}${LIST_NOUN}` +
    String.raw`|who(?: else)? can (?:join|i recruit|i add|i get|be recruited)(?: to)?(?: my| the| our)?(?: party| team)?` +
    String.raw`|(?:what|which) ${LIST_FILL}${LIST_NOUN} can (?:join|i recruit|i add|i get|be recruited)(?: to)?(?: my| the| our)?(?: party| team)?)\??$`);
// "How many chapters are there?" is the same list, counted.
const asList = q => q.replace(/[?!.]+$/, '').replace(/^how many /, 'what are the ');
// The kind of entry a question talks about ("Which companion is the best tank?" -> companions), or null.
export function listNoun(text) {
    const q = normalize(text);
    return LIST_GROUPS.find(([, re]) => new RegExp(`\\b${re.source}\\b`).test(q))?.[0] || null;
}
export function listGroup(text) {
    const q = asList(stripFrames(normalize(text)));
    if (!LIST_RE.test(q)) return null;
    if (/\bwho(?: else)? can\b/.test(q)) return 'companions';
    return LIST_GROUPS.find(([, re]) => new RegExp(`\\b${re.source}\\b`).test(q))?.[0] || null;
}

// Ordered: the first matching rule decides the relationship. Purchase and
// travel cues precede the generic acquisition/location vocabulary.
const INTENTS = [
    ['list', { test: q => LIST_RE.test(asList(q)) }],
    // "What spell heals?", "Which spell makes me invisible?": a search among the spell entries by their stated effect.
    ['spell-search', /^(?:what|which) (?:spells?|magic spells?|shards?) (?!(?:are|is|do (?:i|you|we) have|exist|can i (?:get|learn|use|find)|should i)\b)\S/],
    // "Tell me everything about the Pistol": every relationship the guide records for one subject.
    ['overview', /\b(?:everything|anything and everything|all (?:you know|there is to know|the (?:info|information|details|facts))|(?:the )?full (?:story|details?|info|rundown)|the whole story|a full overview|all about)\b/],
    ['use', /\bhow much (?:does|do|will|would) (?:\S+ ){1,5}(?:heal|restore|damage|hurt|recover|regenerate|drain|protect|cure)\b|\b(?:range|radius|duration|how far|how wide|how long (?:does|do|will|is|are))\b/],
    ['stats', /\bhow much (?:sp|mp|mana|spell points?|stamina|xp|exp|hp|health|damage)\b/],
    ['prerequisites', /\b(?:get|getting|go|going|enter|entering|break|breaking) (?:in|into|inside)\b(?! (?:the )?party)/],
    // The visitor selling is unsupported; a merchant selling is a purchase.
    ['unsupported', /\bwho (?:can|could|may) (?:use|wield|equip|carry|wear)\b|\b(?:i|we|to|can|could)\s+(?:\S+\s+)?(?:sell|pawn)\b|^(?:sell|pawn)\b|\b(?:selling|pawning)\b/],
    // Recruitment advice ("Should I join him to the party?"). Trust or
    // morality judgements are deliberately not included.
    ['advice', /\bshould (?:i|we) (?:recruit|join|take|bring|add|invite|keep|let)\b|\bworth (?:recruiting|taking|bringing|adding|having)\b|\b(?:is|are) (?:he|she|they|it|\S+) worth (?:it|recruiting|having)\b|\b(?:join|add|bring|take) (?:\S+ ){0,2}(?:to|into|in|with) (?:the|my|our) party\b/],
    // "What reagents does An Nox need?" asks how the spell is cast.
    ['use', /\bwhat (?:reagents?|ingredients|components)\b|\b(?:reagents?|ingredients|components) (?:for|of|does|do|in)\b/],
    ['comparison', /\b(?:pros and cons|pros|cons|advantages?|disadvantages?|compare|comparison|versus|vs|difference between|which (?:one |option |ai |solution |setup |is |should i |do you recommend|(?:do|would|will|can|could) (?:i|we) (?:choose|pick|select|go with))|is (?:\S+ ){1,7}better|recommend)\b/],
    // Countering an enemy, curing a condition, reviving a companion.
    ['remedy', new RegExp(String.raw`\b(?:got|gets|get|getting|became|become|becomes|is|was|been|are|were|am|i'm|keeps? getting)\s+(?:\S+\s+){0,2}(?:${CONDITIONS})\b|\b(?:turned|turns|turning) (?:against|on)\b|\b(?:is|are|was|were) (?:now |suddenly |still )?(?:against|attacking|fighting) (?:the|my|our|us)\b`)],
    // A problem statement ("my antivirus is deleting SCHNAIL", "the game crashes on launch") asks for a fix.
    ['remedy', /\b(?:is|are|keeps?|keep|started|starts) (?:\S+ ){0,2}(?:deleting|blocking|blocked|quarantining|quarantined|crashing|freezing|failing|erroring)\b|\b(?:crash(?:es|ed)?|freez(?:es|ing)|froze|fails?|failed|errors?|broken|not (?:loading|loaded|working|detected|starting|launching|responding))\b|\bwon't (?:load|start|launch|run|work)\b/],
    ['remedy', /\bwhat (?:if|happens if|(?:do|should|can) i do (?:if|when|about))\b|\b(?:counter(?:ing|act)?|cure[sd]?|curing|remov(?:e|ing)|get rid of|prevent(?:ing)?|protect(?:ion)? (?:against|from)|resist(?:ing|ance)?|immun\w*|recover(?:y)? from|undo|break (?:the |a )?(?:charm|spell|curse)|revive|resurrect\w*|raise (?:the |a )?dead|bring (?:\S+ ){0,2}back|antidote|stop being|snap (?:\S+ )?out|wake|waking|awaken\w*|deal with being|treat(?:ment)?|fix|fixing|repair|troubleshoot\w*|resolve)\b/],
    ['prerequisites', /\b(?:do|does) (?:\S+ ){1,4}(?:need|require)s?\b|\b(?:prereq\w*|pre-req\w*|requirements?|required|requires|what do i need (?:for|before|to (?:enter|get into|access))|need(?:ed)? (?:before|to (?:enter|get into))|allowed (?:in|into))\b/],
    ['combat', /\b(?:keeps? (?:killing|beating|destroying) me|keep dying|dying to|die to|died to|killed by|(?:kills|killing) me|fight|fighting|defeat|defeating|kill|killing|beat|beating|battle|battling|(?:how (?:do|can|could|should) (?:i|we) |to )(?:destroy|banish)|weakness(?:es)?|weak (?:to|against)|vulnerab\w*|tactics?|strateg(?:y|ies) (?:for|against|vs)|deal with|(?:take|taking|took) (?:down|out)|threat(?: level)?|danger(?: level)?|how dangerous)\b/],
    ['hint', /\b(?:get(?:ting)? (?:past|through|around|by|out|outside)|hide|hiding|conceal|smuggle|smuggling|leave|leaving|exit|bypass|sneak (?:past|by|through|in)|survive|escape|solve)\b/],
    ['hint', /\bhow (?:do|can|could|should|would) (?:i|we) (?:do|pass|clear|tackle|handle|start|begin|get through|work through|go about(?! (?:recruit|hir|buy|purchas|get|obtain|acquir|learn|download|find|reach|locat))|approach)\b|\bwhat(?:'s| is)? (?:next|now)\b|\bnow what\b|\bwhat (?:should|do|can|must) i do\b(?! with)/],
    ['acquisition', /\b(?:farm|farming|grind|grinding|boost|boosting|increase|increasing|learn|learning|teach|teaches|taught|who (?:makes|made|crafts|crafted|forged|teaches|trains)|buy|buying|purchase|purchasing|recruit|recruiting|hire|download|downloading|sell|sells|sold|costs?|price|how much (?:is|are|does|do|would|will|for|money|gold)|join (?:me|my|the|us)|to join)\b/],
    ['location', /\b(?:get to|getting to|reach|travel to|go to|head to|route to|path to|who (?:gives|offers|starts|assigns|hands out)|quest ?giver)\b/],
    ['acquisition', /\bmake (?:some |more |quick |easy )?(?:money|gold)\b|\b(?:get|gets|getting|got|obtain|obtaining|acquire|acquiring|earn|receive|gain|grab|pick up|get my hands on|get your hands on|lay (?:my )?hands on|get (?:a)?hold of|i (?:need|want) (?:a|an|the|some|that|this|it))\b/],
    ['explanation', /\b(?:reward|rewards|bonus|bonuses)\b/],
    // "What's the password for the prison?" asks for the password, not what something is used for.
    ['explanation', /\b(?:password|passcode|combination)\b/],
    // "What class is Geoffrey?", "What circle is In Mani Corp?": a lookup of a fact the record states.
    ['explanation', /\bwhat (?:class|circle|level|town|race|school|rank) (?:is|are|was)\b/],
    ['stats', /\bcan (?:\S+ ){1,2}use (?:guns?|firearms?|pistols?|rifles?)\b|\b(?:stats?|statistics|attributes?|base stats|strength|dexterity|intelligence|combat caps?|magic talent|how strong|how powerful|combat skills?|hp|xp|exp|health|hit points?|experience points?)\b/],
    ['use', /\bwhat (?:should|can|do|could) i do with\b|\b(?:open|opening|enable|enabling|toggle|turn on|use|uses|using|usage|effects?|what (?:does|do|did|will|would|can) (?:\S+ ){0,6}do|(?:what|how) (?:is|are|was|'s) (?:\S+ ){0,5}(?:for|good for|used for)|what's (?:\S+ ){0,5}for|good for|used for|how (?:does|do) (?:\S+ ){0,5}work|equip|equipping|activate|activating|cast|casting|install|installing|installation|set (?:\S+ )?up|setting (?:\S+ )?up|setup|configure|configuring|configuration|stats?|statistics|damage|armou?r class|abilit(?:y|ies)|purpose)\b/],
    // "Found" is a location only as a participle ("where is it found", "can be
    // found"); "What did Batlin found?" uses the verb "to found".
    ['location', /\bwhere (?:do|does|did|can) (?:\S+ ){1,4}(?:live|lives|spawn|spawns|appear|appears|roam|roams|hang out)\b|\b(?:where|wheres|whereabouts|located|location|locate|find|finding|spot|point me|direction|looking for|searching for|search for|track down|come across|coordinates?)\b|\b(?:be|is|are|was|were|get|gets|got) found\b/],
    // "Who has the Grapple?" asks how to come by it.
    ['acquisition', /^who (?:has|holds|keeps|owns|carries)\b/],
    // "Who should I talk to about the murder?" asks for the guide's next step.
    ['hint', /\bwho (?:should|do|can|must) (?:i|we) (?:talk|speak) (?:to|with)\b/],
    ['explanation', /\b(?:what is|what's|whats|what are|what was|who is|who's|whos|who are|who was|tell me about|describe|description|explain|explanation|info|information|details?|lore|background|identity|password|code|role|bonus|bonuses|what happens (?:in|during|at)|summary|summari[sz]e|overview|recap|what kind of|^which\b|what (?:\S+ ){0,2}(?:does|do|will|would) (?:\S+ ){1,6}(?:give|grant|provide|offer)|what (?:\S+ )?(?:is|are) there|^(?:are|is) there)\b/],
    ['hint', /\b(?:hints?|clues?|nudge|next|stuck|what (?:should|do|can|must) i do|what now|help|walkthrough|proceed|progress|tips?|advice|guide me|how (?:do|can|should) i (?:finish|complete|solve))\b/]
];
const METHODS = [
    ['sell', /\b(?:i|we|to|can|could)\s+(?:\S+\s+)?sell\b|^sell\b|\bselling\b/],
    ['recruit', /\b(?:recruit|recruiting|hire|join (?:me|my|the|us)|to join)\b/],
    ['buy', /\b(?:buy|buying|purchase|purchasing|sell|sells|sold|costs?|price|how much (?:is|are|does|do|would|will|for|money|gold))\b/],
    ['download', /\b(?:download|downloading)\b/]
];
// Short bare relation nouns used as follow-ups: "And its effect?", "Location?"
const NOUN_INTENTS = new Map([
    ['effect', 'use'], ['effects', 'use'], ['use', 'use'], ['uses', 'use'], ['stats', 'stats'], ['attributes', 'stats'], ['damage', 'use'],
    ['location', 'location'], ['whereabouts', 'location'], ['coordinates', 'location'],
    ['price', 'acquisition'], ['cost', 'acquisition'],
    ['requirements', 'prerequisites'], ['prerequisites', 'prerequisites'],
    ['weakness', 'combat'], ['threat', 'combat'], ['danger', 'combat'], ['weaknesses', 'combat'], ['strategy', 'combat'], ['tactics', 'combat'],
    ['hint', 'hint'], ['description', 'explanation'], ['reward', 'explanation'], ['rewards', 'explanation'], ['bonus', 'explanation'], ['details', 'explanation'], ['role', 'explanation'],
    ['reagent', 'use'], ['reagents', 'use'], ['ingredients', 'use'], ['components', 'use'],
    ['cure', 'remedy'], ['remedy', 'remedy'], ['counter', 'remedy'], ['antidote', 'remedy'],
    ['pros', 'comparison'], ['cons', 'comparison'], ['comparison', 'comparison']
]);

// Named editions or versions that may differ from the guide's edition. Each
// guide adds the editions it really documents via parse(..., { editions }).
const OTHER_EDITIONS = ['albion online', 'serpent isle', 'forge of virtue', 'remastered', 'starcraft remastered',
    'starcraft ii', 'starcraft 2', 'sc2', 'enhanced edition', 'definitive edition', 'special edition', 'remake',
    'ms-dos', 'dos', 'pc', 'amiga', 'snes', 'super nintendo', 'nes', 'fm towns', 'pc-98', 'c64', 'commodore 64',
    'apple ii', 'atari st', 'sega cd', 'playstation', 'gog', 'exult'];

const PRONOUN = /\b(?:it|its|it's|itself|he|him|his|she|her|they|them|their|there)\b/;
const DEMONSTRATIVE = /(?:(\S+)\s+)?\b(?:that|this)\b(?:\s+(\S+))?/g;
const NOUNISH = new Set(['thing', 'things', 'item', 'stuff', 'one', 'guy', 'person', 'place']);
const EXISTENTIAL_THERE = /\b(?:is|are|was|were) there\b|\bthere (?:is|are|was|were)\b/g;
const DISCOURSE = new Set('no nope yes yeah yep ok okay sorry oops actually well hmm hm right sure thanks thank you cool great nice wait so and also oh ah more else anything please'.split(' '));
const QUESTION_START = String.raw`(?:also\s+)?(?:where|what|what's|whats|how|who|who's|why|when|which|can|could|does|do|did|is|are|should|would|will|tell|give|any|its|it's|their|his|her)\b`;
// "and" only separates subquestions when a new question begins after it. In
// a statement without "?", "and is now…" continues the same sentence, so only
// question words split it.
const STATEMENT_START = String.raw`(?:also\s+)?(?:where|what|what's|whats|how|who|who's|why|when|which)\b`;
// "!" and "." end a subquestion only before a new question, so names such as
// "Free Weston!" survive.
const SPLIT = new RegExp(String.raw`\s*(?:[?;]+|[.!]+(?=\s+${QUESTION_START})|[.!]+$|,\s*(?=${QUESTION_START})|,?\s+(?:and|also|plus|then|but)\s+(?=${QUESTION_START}))\s*`);

const REPORT = [
    /^i (?:already |now |just |finally |still |currently |have )*(?:have|got|obtained|acquired|completed|finished|did|done|lost|recruited|beat|defeated|own)\b/,
    /^i (?:have not|haven't|have never|did not|didn't|do not|don't|no longer|never|still don't|still do not|currently don't) (?:have|got|obtained|acquired|completed|finished|did|do|done|lost|own|complete|finish)\b/,
    /^i (?:no longer|don't|do not) have\b/,
    /^i(?:'m| am) (?:now |currently |still )?(?:at|in) \S/,
    /^.+ (?:is|isn't|is not) (?:currently |now |still |no longer )?in my party$/
];
const NOT_REPORT = new RegExp(String.raw`^i (?:got|get|was|am|'m|have been|became|keep getting) (?:\S+ ){0,2}(?:${CONDITIONS})\b`).source + '|' + /^i (?:have|had|got) (?:to|a question|questions|no idea|trouble|a problem|been|stuck|lost my way|confused)\b|^i got (?:stuck|lost|confused)\b|^i(?:'m| am) in (?:trouble|a hurry|doubt)\b/.source;
const NOT_REPORT_RE = new RegExp(NOT_REPORT);
const UNCERTAIN = /\b(?:think|thought|maybe|perhaps|probably|possibly|might|guess|suppose|believe|not sure|unsure|apparently|seems?|seemingly|kind of|sort of)\b/;
const REPORTED = /\b(?:said|says|told|someone|somebody|heard|according|claims?|claimed)\b/;
const HYPOTHETICAL = /\b(?:if|once|assuming|unless|when|after|suppose|supposing|imagine|what if|let's say|say|in case)\s+(?:i|i've|i'd|we|my party)\s+(?:already\s+|ever\s+|have\s+|had\s+|do not\s+|don't\s+|didn't\s+)*(?:have|had|got|did|do|done|complete|completed|finish|finished|obtain|obtained|acquire|acquired|recruit|recruited|lost|lose|beat|defeated|own)\b|\b(?:if|suppose|supposing|assuming|imagine|what if)\b.*\bin my party\b/;
const SUBJECT_CORRECTION = /^(?:(?:sorry|oops|whoops|no|nope|actually|wait|correction|my bad|err|er|um|uh|oh|ah|hmm|ok|okay)[,!.]*\s+)*(?:i\s+(?:meant|mean|was asking about|was talking about|was referring to|wanted to ask about)|what i meant was|make that|rather)\s+(.+)$/;
const FOLLOW_UP = /^(?:(?:and|ok|okay|so|then|also)\s+)?(?:(?:what|how)\s+about|same\s+(?:question\s+|thing\s+)?(?:for|about|with)|and\s+(?:for|with)|and)\s+(.+)$/;
const AFFIRM = /^(?:yes|yeah|yep|yup|sure|correct|right|that one|that's it|that's the one|exactly|yes please|yes that one)$/;

function escape(text) { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
const squash = text => text.replace(/\s+/g, ' ').trim();
const trimEnd = text => squash(text).replace(/^[\s,;:.!-]+|[\s,;:.!?-]+$/g, '');

// One compiled pattern per guide's edition list, not one per edition per question.
const editionPatterns = new Map();
function editionPattern(known) {
    const key = known.join('\u0000');
    if (!editionPatterns.has(key)) {
        const list = [...new Set([...known.map(normalize), ...OTHER_EDITIONS])].filter(Boolean)
            .sort((a, b) => b.length - a.length).map(escape);
        editionPatterns.set(key, new RegExp(`(?<![\\p{L}\\p{N}])(?:${list.join('|')})(?![\\p{L}\\p{N}])`, 'gu'));
        if (editionPatterns.size > 16) editionPatterns.delete(editionPatterns.keys().next().value);
    }
    return editionPatterns.get(key);
}
function editionsIn(q, known) {
    const found = new Set();
    for (const match of q.matchAll(/\b(?:version|ver|patch|release|build|v)\s*\.?\s*(\d+(?:\.\d+)*[a-z]?)\b/g)) found.add(match[1]);
    // Overlapping names ("starcraft remastered", "remastered") are both found.
    const pattern = editionPattern(known);
    for (let i = 0; i < q.length; i++) {
        pattern.lastIndex = i;
        const match = pattern.exec(q);
        if (!match) break;
        found.add(match[0]);
        i = match.index;
    }
    // Dotted multi-part numbers such as 1.16.1 identify releases, not quantities.
    for (const t of tokens(q)) if (/^\d+\.\d+\.\d+$/.test(t)) found.add(t);
    // Prefer the guide's own edition name inside a longer phrase
    // ("starcraft remastered" -> "remastered"); otherwise keep the longest.
    const knownSet = new Set(known.map(normalize));
    return [...found].filter(e => knownSet.has(e) || ![...found].some(other => other !== e
        && (other.includes(e) || (knownSet.has(other) && e.includes(other)))));
}

// "…if I have Starcraft Remastered" names the visitor's edition. It restricts the question to that edition; it is
// not a hypothetical about progress. Anything else after the verb ("if I have the Pistol") stays a hypothetical.
const EDITION_FILLER = new Set('the a an my our version versions edition editions copy of game installed on pc'.split(' '));
function editionOnlyCondition(q, known) {
    const match = HYPOTHETICAL.exec(q);
    if (!match) return false;
    const clause = q.slice(match.index + match[0].length).split(/[,;?.!]|\s(?:which|what|where|how|who|should|can|could|do|does|then)\s/)[0];
    const rest = clause.replace(editionPattern(known), ' ');
    const words = tokens(rest).filter(word => !EDITION_FILLER.has(word));
    return !words.length && editionsIn(clause, known).length > 0;
}
// "I have Starcraft Remastered, which option should I choose?" gives context to the other subquestion.
function editionStatement(core, known) {
    const m = core.match(/^(?:(?:if|when|since|as|assuming) )?i (?:currently |only |also |just )*(?:have|own|play|use|run)\s+(.+)$/) || core.match(/^(?:i'm|i am) (?:currently |only |also |just )*(?:on|playing|using|running)\s+(.+)$/);
    if (!m) return false;
    const rest = m[1].replace(editionPattern(known), ' ');
    return !tokens(rest).filter(word => !EDITION_FILLER.has(word)).length && editionsIn(m[1], known).length > 0;
}

function stripFrames(q, names = []) {
    // Authorized literal names may contain ordinary request framing, such as
    // "Toronto Again". Protect only those exact spans while removing filler.
    // The standalone parser remains independent of guide data; its caller
    // supplies names already resolved at the current spoiler ceiling.
    const spans = [];
    let marker = '\uE000';
    while (q.includes(marker)) marker += '\uE000';
    for (const name of [...new Set(names.map(normalize))].sort((a, b) => b.length - a.length)) {
        if (!name) continue;
        const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escape(name).replaceAll(' ', '\\s+')}(?=$|[^\\p{L}\\p{N}])`, 'gu');
        q = q.replace(pattern, (whole, prefix) => {
            const key = `${marker}${spans.length}\uE001`;
            spans.push([key, whole.slice(prefix.length)]);
            return prefix + key;
        });
    }
    let previous;
    do { previous = q; q = q.replace(FRAME_RE, ' '); } while (q !== previous);
    for (const [key, name] of spans) q = q.split(key).join(name);
    return squash(q);
}

function hasPronoun(q) {
    const text = q.replace(EXISTENTIAL_THERE, ' ');
    if (PRONOUN.test(text)) return true;
    // "that"/"this" refer back unless they introduce a descriptive clause
    // ("the gun that shoots", "the thing that does") or a noun ("this chapter").
    const word = value => value?.replace(/[^\p{L}\p{N}']/gu, '');
    for (const match of text.matchAll(DEMONSTRATIVE)) {
        const previous = word(match[1]), next = word(match[2]);
        if (previous && (!SCAFFOLD.has(previous) || NOUNISH.has(previous))) continue;
        if (!next || SCAFFOLD.has(next)) return true;
    }
    return false;
}

export function detectIntent(text) {
    const q = stripFrames(text);
    for (const [intent, pattern] of INTENTS) {
        // "Is the Shadowsword cursed?" asks about a state; it is not a request for a cure.
        if (intent === 'remedy' && /^(?:is|are|was|were)\b/.test(q) && !/\b(?:cure|counter|remov\w*|fix|undo|revive|prevent\w*|get rid)\b/.test(q)) continue;
        if (pattern.test(q)) return intent;
    }
    const words = tokens(q).filter(t => !SCAFFOLD.has(t) || NOUN_INTENTS.has(t));
    // Bare relationship nouns: "And its effect?", "Location?"
    const nouns = words.filter(t => NOUN_INTENTS.has(t));
    if (nouns.length === 1 && words.length <= 3) return NOUN_INTENTS.get(nouns[0]);
    return null;
}

export function detectMethod(text) {
    const q = stripFrames(text);
    return METHODS.find(([, pattern]) => pattern.test(q))?.[0] || null;
}

// Story roles are separate from the established intent reader. An engine
// with authored story facts can use them; other guides keep their existing
// interpretation. Captures retain subjects and every additional qualifier.
const STORY_QUESTIONS = [
    ['participants', /^who (?:killed|murdered) (?:who|whom)(?: (.*))?$/],
    // Reversing the question reverses the requested role, never the fact.
    ['victim', /^whom? did (.+?) (?:kill|murder)(?: (.*))?$/, 1],
    ['perpetrator', /^who (?:was|were|is|are) (.+?) (?:killed|murdered) by(?: (.*))?$/, 1],
    ['victim', /^who (?:was|were|is|are) (?:(not|never|only) )?(?:killed|murdered)(?: (.*))?$/],
    ['perpetrator', /^who (?:killed|murdered)(?: (.*))?$/, 1],
    ['perpetrator', /^who (?:(not|never|only) )?committed (?:(?:the|a|an) )?murders?(?: (.*))?$/],
    ['perpetrator', /^who (did not|didn't|does not|doesn't|never) (?:kill|murder)(?: (.*))?$/, 2],
    ['perpetrator', /^who(?: is| are| was| were|'s) (?:(not|never|only) )?(?:(?:the|a|an) )?(?:(not|never|only) )?(?:murderers?|killers?) of (.+)$/, 3],
    ['perpetrator', /^who(?: is| are| was| were|'s) (?:(not|never|only) )?(?:(?:the|a|an) )?(?:(not|never|only) )?(?:murderers?|killers?)(?: of)?(?: (.*))?$/],
    ['perpetrator', /^who(?: is| are| was| were|'s) (?:(not|never|only) )?(?:(?:the|a|an) )?perpetrators?(?: of)?(?: (.*))?$/],
    ['victim', /^who(?: is| are| was| were|'s) (?:(not|never|only) )?(?:(?:the|a|an) )?(?:(not|never|only) )?(?:murder )?victims?(?: of)?(?: (.*))?$/],
    ['suspect', /^who(?: is| are| was| were|'s) (?:(not|never|only) )?(?:(?:the|a|an) )?(?:(not|never|only) )?(?:suspects?|suspected)(?: (.*))?$/],
    ['leader', /^who (?:leads|runs)(?: (.*))?$/],
    ['leader', /^who(?: is| are| was| were|'s) (?:(not|never|only) )?(?:(?:the|a|an) )?(?:(not|never|only) )?leaders?(?: of)?(?: (.*))?$/],
    ['leader', /^who(?: is| are| was| were|'s) (?:(?:the|a|an) )?(.+?) leaders?(?: (.*))?$/],
    ['member', /^who belongs to(?: (.*))?$/],
    ['member', /^who(?: is| are| was| were|'s) (?:(not|never|only) )?(?:(?:the|a|an) )?(?:(not|never|only) )?members?(?: of)?(?: (.*))?$/],
    ['member', /^who(?: is| are| was| were|'s) (?:(?:the|a|an) )?(.+?) members?(?: (.*))?$/]
];
// A bare place, time, or other qualifying clause does not name the person
// whose role is being asked about. Keep its words in query either way.
const STORY_CONTEXT_PREFIX = /^(?:in|at|near|by|around|within|outside|inside|on|off|along|across|between|throughout|under|over|below|above|behind|beyond|beside|during|before|after|since|until|while|when|where|for|from|with|without|according to)\b/;
const GUIDE_QUESTION_PREFIX = /^(according to (?:(?:the|this|your) )?guide(?: only)?)[,:]?\s+(.+)$/;
// A request to answer from the guide alone, wherever it appears: "according
// to the guide", "using only the guide", "per the guide", "guide only".
const GUIDE_DET = String.raw`(?:the|this|your)`;
const GUIDE_SOURCE_PHRASE = String.raw`according to (?:${GUIDE_DET} )?guide(?: only| alone)?|(?:from|in|using|per|going by|based on) ${GUIDE_DET} guide(?: only| alone)?|(?:using|use) only ${GUIDE_DET} guide|only (?:from|using|in) ${GUIDE_DET} guide|${GUIDE_DET} guide (?:only|alone)|guide[- ]only`;
export const GUIDE_SOURCE = new RegExp(String.raw`(?<![\p{L}\p{N}])(?:${GUIDE_SOURCE_PHRASE})(?![\p{L}\p{N}])`, 'u');
const GUIDE_SOURCE_ALL = new RegExp(GUIDE_SOURCE.source, 'gu');
// "Using only the guide, who …?" and "Guide only: who …?" restrict the
// question that follows, like "According to the guide, …". The lead-in is
// rewritten to that canonical form so every reader sees one restriction.
const GUIDE_SOURCE_LEAD = new RegExp(String.raw`^(?:only\s+)?(?:${GUIDE_SOURCE_PHRASE})\s*[,:]\s*(?=\S)`, 'u');
// "Who killed X? Use the guide only." A closing instruction, not a question.
const GUIDE_SOURCE_DIRECTIVE = new RegExp(String.raw`(?:^|[.?!;]\s*)(?:please\s+)?(?:(?:only\s+)?(?:use|using|answer (?:from|with|using)|stick to|go by)\s+(?:only\s+)?${GUIDE_DET} guide(?:\s+(?:only|alone))?|(?:${GUIDE_DET} )?guide[- ]only)(?:,?\s+please)?[.!]?\s*$`, 'u');

export function storyQuestion(text) {
    let q = trimEnd(normalize(text));
    // These patterns read one bounded question, not arbitrary prose or a
    // sequence of clauses. Long or compound input stays with normal parsing.
    if (!q || q.length > 512 || /[?;]/.test(q)) return null;
    const sourcePrefix = q.match(GUIDE_QUESTION_PREFIX);
    if (sourcePrefix) q = `${sourcePrefix[2]} ${sourcePrefix[1]}`;
    for (const [role, pattern, targetCapture] of STORY_QUESTIONS) {
        const match = q.match(pattern);
        if (match) {
            const target = targetCapture ? (match[targetCapture] || '').trim() : '';
            return {
                role, query: squash(match.slice(1).filter(Boolean).join(' ')),
                // A victim or suspect can belong to an accusation or another
                // event. Only explicit homicide wording asks for a crime fact.
                ...(/\b(?:kill(?:ed|er|ers|ing|s)?|murder(?:ed|er|ers|ing|s)?)\b/.test(q) ? { crime: true } : {}),
                ...(target && !STORY_CONTEXT_PREFIX.test(target) ? { personTarget: true } : {})
            };
        }
    }
    return null;
}

// Open story questions request an explicitly indexed kind of explanation.
// Keep their remaining predicates intact: naming a person is not enough to
// establish a cause, method, consequence or relationship involving them.
// These words are removed only by their own question form, never added to
// SCAFFOLD where they could erase restrictions on an unrelated question.
const NARRATIVE_QUESTIONS = [
    // Guide instructions and historical chronology are distinct claims.
    // Asking for a next step never makes the next listed step an event.
    ['sequence', /^(?:what (?:is|was)|what's) (?:(?:the|a) )?next step(?: (.*))?$/, 'steps'],
    ['sequence', /^what(?: (?:comes|is)|'s) next (in (?:(?:the|this|your) )?guide(?: .*)?)$/, 'steps'],
    ['sequence', /^what (?:happened|came) next(?: (.*))?$/, 'events'],
    ['sequence', /^what (?:happened|came|followed) (after .+)$/, 'events'],
    ['sequence', /^what followed (.+)$/, 'events'],
    ['event', /^what happened ((?:to|at|in|during) .+)$/],
    ['cause', /^why (?:did|does|was|were|is|are) (.+)$/],
    // A negative auxiliary stays in the query, so its negation cannot be
    // mistaken for a positive causal explanation.
    ['cause', /^why ((?:didn't|doesn't|wasn't|weren't|isn't|aren't) .+)$/],
    ['method', /^how did ((?!(?:i|we|you)\b).+)$/],
    ['method', /^(?:what (?:is|was)|what's) (?:(?:the|a) )?method (?:for|of) (.+)$/],
    ['outcome', /^(?:what (?:is|are|was|were)|what's) (?:(?:the|a|an|its|their) )?(?:outcomes?|results?|consequences?)(?: (?:of|for) (?:it|that|this|them))?$/],
    ['outcome', /^(?:(?:what (?:is|are|was|were)|what's) )?(?:(?:the|a|an) )?(?:outcomes?|results?|consequences?) (?:of|for) (.+)$/],
    ['relationship', /^(?:what (?:is|are|was|were)|what's) (?:(?:the|a|an) )?(?:relationship|relation|connection) between (.+ and .+)$/],
    ['relationship', /^how (?:is|are|was|were) (.+ and .+?) related(?: (.*))?$/],
    ['relationship', /^how (?:is|are|was|were) (.+?) related ((?:to|with) .+)$/],
    ['method', /^how (?:was|were) ((?!(?:i|we|you)\b).+)$/],
    ['purpose', /^what (?:does|do|did) (.+?) want(?: (.*))?$/],
    ['purpose', /^(?:what (?:is|are|was|were)|what's) (?:(?:the|a|an) )?(?:purpose|goals?|aims?) of (.+)$/],
    ['summary', /^(?:summari[sz]e|recap) (.+)$/],
    ['summary', /^(?:(?:what is|what's|give me) )?(?:(?:the|a|an) )?summary of (.+)$/],
    ['identity', /^(?:who|what)(?: (?:is|are|was|were)|'s) (.+)$/]
];
const NARRATIVE_COMPOUND = /[?;]|[.!](?=\s)|\b(?:and|also|plus|then|but)\s+(?:who|what|where|why|when|how|can|could|should|would|do|does|did|is|are)\b/;
const NARRATIVE_KINSHIP = 'son|daughter|father|mother|wife|husband|brother|sister|parent|spouse|friend';
const NARRATIVE_POSSESSIVE = new RegExp(`^who(?: (?:is|are|was|were)|'s) (?:(?:the|a|an) )?(.+?)'s (${NARRATIVE_KINSHIP})(?: (.*))?$`);
const NARRATIVE_OF = new RegExp(`^who(?: (?:is|are|was|were)|'s) (?:(?:the|a|an) )?(${NARRATIVE_KINSHIP}) of (.+)$`);
const NARRATIVE_NONVERBS = new Set(('is are was were be been being do does did can could should would will shall may might must ought has have had ' +
    'i we you he she they it me us him her them my our your his their its this that these those there who what which whose whom not never no only').split(' '));

export function narrativeQuestion(text) {
    const q = trimEnd(normalize(text));
    // As with role questions, this reader handles one bounded question.
    // Reports, hypothetical progress and gameplay requests retain the
    // established interpreter. Existing typed story roles take priority.
    if (!q || q.length > 512 || NARRATIVE_COMPOUND.test(q)
        || HYPOTHETICAL.test(q) || storyQuestion(q)) return null;
    const sourcePrefix = q.match(GUIDE_QUESTION_PREFIX);
    if (sourcePrefix) {
        const frame = narrativeQuestion(sourcePrefix[2]);
        return frame ? { ...frame, query: squash(`${frame.query} ${sourcePrefix[1]}`),
            ...(frame.contextual ? { guideOnly: true } : {}) } : null;
    }
    if (/^why(?: (?:is|was) that)?$/.test(q)) return { aspect: 'cause', query: '', contextual: true };
    if (/^(?:how are (?:they|those two|these two) related|what(?: is|'s) (?:their (?:relationship|connection)|the (?:relationship|connection) between them))$/.test(q))
        return { aspect: 'relationship', query: '', contextual: true, pair: true };
    // The target is the person whose relation was requested, not the
    // requested relative. Only an authored directed relationship may answer
    // it; the reader never turns son into father or reverses a friendship.
    const possessive = q.match(NARRATIVE_POSSESSIVE), of = q.match(NARRATIVE_OF);
    if (possessive || of) {
        const target = possessive ? possessive[1] : of[2];
        const predicate = possessive ? possessive[2] : of[1];
        return { aspect: 'relationship', query: squash([target, predicate, possessive?.[3]].filter(Boolean).join(' ')),
            target, predicate, directed: true };
    }
    for (const [aspect, pattern, sequenceMode] of NARRATIVE_QUESTIONS) {
        const match = q.match(pattern);
        if (!match) continue;
        const query = squash(match.slice(1).filter(Boolean).join(' '));
        return { aspect, query, ...(!query ? { contextual: true } : {}), ...(sequenceMode ? { sequenceMode } : {}) };
    }
    // A requested actor can be indexed for any authored predicate. This does
    // not establish its inverse or treat co-occurring names as related.
    // Existing gameplay verbs retain the established relationship reader,
    // including simple third-person inflections such as "recruits".
    const actor = q.match(/^who ([\p{L}][\p{L}'-]*) (.+)$/u);
    if (actor && !NARRATIVE_NONVERBS.has(actor[1]) && !detectIntent(q)
        && !(actor[1].endsWith('s') && detectIntent(`who ${actor[1].slice(0, -1)} ${actor[2]}`))) {
        return { aspect: 'relationship', query: `${actor[2]} ${actor[1]}`,
            target: actor[2], predicate: actor[1], directed: true };
    }
    return null;
}

/**
 * Terms that could restrict an answer and are not merely the subject name,
 * request framing or relationship vocabulary. Every returned term must be
 * supported by the authorised fact text before the fact is used.
 */
export function materialTerms(text, matchedTerms = [], editions = []) {
    const names = new Set(matchedTerms.flatMap(term => tokens(term)).map(possessive));
    const editionTerms = new Set(editions.flatMap(edition => tokens(edition)));
    // A guide-only request restricts the source, never the fact's wording.
    const q = stripFrames(normalize(text).replace(GUIDE_SOURCE_ALL, ' ')).replace(CUE_RE, ' ');
    // A historical discovery asks where something was found, which a
    // present location or an unrelated clue cannot establish.
    const discovery = /^where (?:was|were)\b.*\bfound\b/.test(q);
    return tokens(q).map(possessive).filter(t => (!SCAFFOLD.has(t) || (discovery && t === 'found')) && !names.has(t) && !editionTerms.has(t)
        && !/^\d+(?:[.-]\d+)*$/.test(t));
}

function makePart(text, known, names = []) {
    const q = trimEnd(text);
    const framed = squash(stripFrames(q, names));
    const core = framed.replace(/^(?:and|also|plus|then|but|so)\s+/, '');
    // A subject such as the spell Kill or Cure can also be an action word.
    // The engine decides whether those words are an explicit new question or
    // the name following "what about"; keep the follow-up phrase available.
    const followUp = framed.match(FOLLOW_UP)?.[1] || null;
    return {
        q, core,
        // A statement such as "I got the Pistol" inside a compound message is
        // never applied as progress and never answered as a question.
        report: REPORT.some(pattern => pattern.test(core)) && !NOT_REPORT_RE.test(core),
        intent: detectIntent(q),
        story: storyQuestion(core),
        narrative: narrativeQuestion(core),
        guideOnly: GUIDE_SOURCE.test(core),
        method: detectMethod(q),
        editions: editionsIn(q, known),
        pronoun: hasPronoun(core),
        editionContext: editionStatement(core, known),
        followUp: followUp ? trimEnd(followUp) : null
    };
}

function isDiscourseOnly(part) {
    const words = tokens(part.core);
    return !part.intent && words.every(word => DISCOURSE.has(word));
}

// "I just started" names no subject: before a question it is dropped, and on
// its own it asks where to begin.
const NEWCOMER = /^(?:(?:hi|hey|hello|ok|okay|so|well),?\s+)?(?:i(?:'m| am) new(?: here| to (?:this|the) game)?|(?:i )?(?:have )?(?:just |only just )?(?:started|begun|began)(?: (?:the|this) game| playing| here)?|(?:it's |this is )?my first time(?: playing| here)?)$/;
// "What to do here?", "Where do I start?" ask for the selected section's next
// step, so they take the canonical "what now" form.
const START_HERE = /^(?:(?:so|ok|okay|and|well|then),?\s+)?(?:what (?:(?:should|do|can|must) (?:i|we) |to )do|where (?:do|should|can) (?:i|we) (?:start|begin)|how (?:do|should|can) (?:i|we) (?:start|begin)|what now)(?: (?:here|now|next|then))?$/;
const STATEMENT_SPLIT = new RegExp(SPLIT.source.replaceAll(QUESTION_START, STATEMENT_START));
export function splitParts(q, known = [], names = []) {
    // The comma in "According to the guide, why ...?" introduces the
    // question, rather than separating it from its source restriction.
    const sourceAware = q.replace(GUIDE_QUESTION_PREFIX, '$1 $2');
    let segments = sourceAware.split(q.includes('?') ? SPLIT : STATEMENT_SPLIT).map(trimEnd).filter(Boolean);
    const asked = segments.filter(segment => !NEWCOMER.test(segment));
    segments = (asked.length ? asked : segments.map(() => 'what now'))
        .map(segment => START_HERE.test(segment) ? 'what now' : segment);
    return segments.map(segment => makePart(segment, known, names)).filter(part => part.core && !isDiscourseOnly(part));
}

function isReport(q, raw) {
    if (/["“”]/.test(raw) || /^'.*'$/.test(q) || /\?\s*$/.test(raw)) return false;
    const body = q.replace(/^(?:(?:no|actually|correction|ok|okay|well|sorry|update)[,:]?\s+)+/, '').replace(/[.!]+$/, '').trim();
    if (NOT_REPORT_RE.test(body) || UNCERTAIN.test(body) || REPORTED.test(body) || HYPOTHETICAL.test(body)) return false;
    return REPORT.some(pattern => pattern.test(body));
}

/**
 * Parse one visitor message.
 *
 * Returns the normalised text `q`, conversational flags (`correction` is a
 * progress report; `subject` is "I meant X"), the primary `intent` and up to
 * MAX_PARTS clearly separated subquestions. Nothing here consults guide data.
 */
export function parse(text, { editions = [], names = [] } = {}) {
    const raw = String(text || '');
    // An em dash or spaced en dash separates clauses in English prose.
    let q = normalize(raw.replace(/\s*—\s*|\s+–\s+/g, '; ')).replace(/\bi've\b/g, 'i have')
        // A mistyped question word at the start ("wher is Jaana", "hw do I get the carpet").
        .replace(/^(?:and\s+|ok\s+|so\s+)?(wher|whre|whree|wheer|were is|wheres|whar|wat|wht|wich|hw|hwo|waht|whats|hows)\b/, (all, word) =>
            all.replace(word, { wher: 'where', whre: 'where', whree: 'where', wheer: 'where', 'were is': 'where is', wheres: "where's", whar: 'what', wat: 'what', wht: 'what', wich: 'which', hw: 'how', hwo: 'how', waht: 'what', whats: "what's", hows: "how's" }[word]))
        // Players abbreviate StarCraft: Remastered; the abbreviation names the edition, never a subject.
        .replace(/(?<![\p{L}\p{N}])sc:?r(?![\p{L}\p{N}])/gu, 'starcraft remastered');
    // A guide-only lead-in or closing instruction restricts every part.
    let guideOnly = false;
    q = q.replace(GUIDE_SOURCE_DIRECTIVE, () => { guideOnly = true; return ''; }).trim();
    if (GUIDE_SOURCE_LEAD.test(q)) {
        guideOnly = true;
        if (!/^according to\b/.test(q)) q = q.replace(GUIDE_SOURCE_LEAD, 'according to the guide, ');
    }
    else if (guideOnly && q) q = `according to the guide, ${q}`;
    const sourced = parts => guideOnly ? parts.map(part => ({ ...part, guideOnly: true })) : parts;
    const base = { raw, q, intent: null, correction: false, hypothetical: false, editions: [], clauses: [],
        parts: [], subject: null, affirm: false, tooMany: false };
    if (!q) return base;
    base.clauses = q.split(/[?;!]+|\.(?=\s)/).map(trimEnd).filter(Boolean);
    base.editions = editionsIn(q, editions);
    base.hypothetical = HYPOTHETICAL.test(q) && !editionOnlyCondition(q, editions);
    if (/^(?:please\s+)?(?:reset|restart|start over|clear (?:the )?(?:chat|conversation|topic|session|history)|new (?:topic|conversation))\b/.test(q)) return { ...base, intent: 'reset' };
    if (/\b(?:smaller|gentler|vaguer|subtler|softer|less (?:revealing|detail|detailed|specific|direct)|not so (?:direct|detailed|specific))\b/.test(q)) return { ...base, intent: 'smaller' };
    if (AFFIRM.test(trimEnd(q))) return { ...base, affirm: true };
    const subject = q.match(SUBJECT_CORRECTION);
    if (subject) {
        const [head, ...tail] = subject[1].split(/\s*(?:[,;:?!]+|\.(?=\s))\s*/);
        const subjectPart = makePart(head, editions, names);
        // "I mean, where is it?" is a question, not a change of subject.
        if (!subjectPart.intent) {
            const rest = splitParts(tail.join('; '), editions, names);
            return { ...base, subject: { q: trimEnd(head), core: subjectPart.core.replace(/^(?:the|a|an)\s+/, '') }, parts: sourced(rest.slice(0, MAX_PARTS)),
                tooMany: rest.length > MAX_PARTS, intent: rest[0]?.intent || null };
        }
    }
    base.correction = isReport(q, normalize(raw));
    let parts = splitParts(q, editions, names);
    const context = parts.filter(part => part.editionContext);
    if (context.length && context.length < parts.length) {
        const named = [...new Set(context.flatMap(part => part.editions))];
        parts = parts.filter(part => !part.editionContext).map(part => ({ ...part, editions: [...new Set([...part.editions, ...named])] }));
    }
    return { ...base, parts: sourced(parts.slice(0, MAX_PARTS)), tooMany: parts.length > MAX_PARTS, intent: parts[0]?.intent || null };
}

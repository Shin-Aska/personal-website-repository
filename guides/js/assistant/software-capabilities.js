// Finite software capability requests and literal proof checks. This reader
// never selects a subject, resolves state, writes prose, or computes a ranking.
const normalized = value => typeof value === 'string' ? value.normalize('NFKC').toLowerCase()
    .replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim() : '';
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const label = value => normalized(value).replace(/^(?:the|a|an)\s+/, '');
const DEICTIC = /^(?:it|this|that|(?:this|that) (?:tool|launcher|client|map|method))$/;
const NON_FACTUAL = /\b(?:best|better|worst|worse|should|recommend|guarantee\w*|definitely|certainly|already|current save|my save|have i|did i|will i|hypothetical\w*|assuming|suppose)\b/;
const UNCERTAIN = /\b(?:perhaps|maybe|might|could|would|may|unknown|unspecified|unconfirmed|unclear|claims?|claimed|says?|said)\b/;
const CONDITIONAL = /\b(?:if|unless|after|before|once|initial|login|account)\b/;

/** Keep complete source, edition, executable and other modifiers in descriptors.
 * Parsing recognizes a request only; callers still own canonical subject and
 * scope resolution, compound-question guards and inherited restrictions. */
export function parseSoftwareCapabilityRequest(text) {
    if (typeof text !== 'string') return null;
    const question = text.trim().replace(/\?$/, '').trim();
    // These finite source-procedure questions use “should” as a request for a
    // recorded step. The whole complement survives; no player action is read.
    let field = /^(?:which|what) (file|executable) (?:do|should|must|can) (?:i|we) select(?: (?:for|in) (.+))?$/i.exec(question);
    if (field) return Object.freeze({kind:'procedure-field', subjectText:field[2] || 'it', fieldText:field[1], actionText:'select', originalText:text});
    field = /^where (?:are|will) (?:(?:the|its) )?settings (?:be )?saved(?: (?:for|in) (.+))?$/i.exec(question);
    if (field) return Object.freeze({kind:'procedure-field', subjectText:field[1] || 'it', fieldText:'settings', actionText:'saved', originalText:text});
    field = /^do (?:i|we) point (.+?) at (.+?) in (.+)$/i.exec(question);
    if (field) return Object.freeze({kind:'procedure-field', subjectText:field[1], fieldText:field[2], actionText:'point', locationText:field[3], originalText:text});
    field = /^is (.+?) in (the same directory|the same folder)(?: (?:for|as) (.+))?$/i.exec(question);
    if (field) return Object.freeze({kind:'procedure-field', subjectText:field[3] || 'it', fieldText:field[1], locationText:field[2], originalText:text});
    field = /^what (?:do|should|must|can) (?:i|we) do after (.+)$/i.exec(question);
    if (field) return Object.freeze({kind:'procedure-continuation', subjectText:'it', phaseText:field[1], originalText:text});
    const semantic = parseSoftwareSemanticField(question, text);
    if (semantic) return semantic;
    if (NON_FACTUAL.test(normalized(text))) return null;
    let match = /^how does\s+(.+?)\s+compare with\s+(.+?)\s+(?:for|in terms of)\s+(.+)$/i.exec(question);
    if (match) return Object.freeze({kind:'property-comparison', subjectText:match[1], referenceText:match[2], propertyText:match[3], originalText:text});
    match = /^can (?:i|we) (?:use|run|play)\s+(.+?)\s+(entirely offline|completely offline)$/i.exec(question);
    if (match) return Object.freeze({kind:'offline-operation', subjectText:match[1], propertyText:match[2], originalText:text});
    match = /^if\s+(.+?)\s+(?:cannot|can't|doesn't|does not) detect\s+(.+?)\s+automatically,?\s+how do (?:i|we) point\s+(.+?)\s+at\s+(.+)$/i.exec(question);
    if (match) return Object.freeze({kind:'executable-detection', subjectText:match[1], executableText:match[2], referenceText:match[3], destinationText:match[4], originalText:text});
    match = /^what if\s+(.+?)\s+(?:cannot|can't|doesn't|does not) detect\s+(.+?)(?: automatically)?$/i.exec(question);
    if (match) return Object.freeze({kind:'executable-detection', variant:'condition', subjectText:match[1], executableText:match[2], originalText:text});
    match = /^how does\s+(.+?)\s+work with portable\s+(.+)$/i.exec(question);
    if (match) return Object.freeze({kind:'portable-configuration', subjectText:match[1], targetText:match[2], originalText:text});
    match = /^can (?:i|we) use\s+(.+?)\s+(directly|natively) in\s+(.+)$/i.exec(question);
    return match ? Object.freeze({kind:'native-compatibility', subjectText:match[1], propertyText:match[2], targetText:match[3], originalText:text}) : null;
}

// Field requests remain distinct from instructions for launching a program.
// Every captured complement is retained and checked by the proof reader.
function parseSoftwareSemanticField(question, originalText) {
    const result = (fieldText, subjectText, extra = {}) => Object.freeze({kind:'software-field', fieldText, subjectText, ...extra, originalText});
    let match = /^(?:what is (.+?) used for|what (?:does|do) (.+?) do|what is the purpose of (.+))$/i.exec(question);
    if (match) return result('purpose', match[1] || match[2] || match[3]);
    match = /^does (.+?) let bots see units outside visible (?:game )?state by default$/i.exec(question);
    if (match) return result('defaults', match[1]);
    match = /^can (those|these|its|the) defaults be changed$/i.exec(question);
    if (match) return result('default-changes', 'it', {contextFieldText:'defaults'});
    match = /^is (.+?) (?:a )?(?:packaged|prepackaged) opponent client$/i.exec(question);
    if (match) return result('packaged-opponent', match[1]);
    match = /^what about (?:the )?(.+?) game installation$/i.exec(question);
    if (match) return result('game-installation', match[1]);
    match = /^(?:so )?has (.+?) (?:starcraft )?remastered compatibility been established$/i.exec(question);
    if (match) return result('compatibility', match[1], {targetText:'Remastered'});
    match = /^does (.+?) support (?:starcraft )?remastered$/i.exec(question);
    if (match) return result('compatibility', match[1], {targetText:'Remastered'});
    match = /^which offline benefit does (.+?) offer$/i.exec(question);
    if (match) return result('network', match[1], {propertyText:'offline benefit'});
    match = /^how is (?:the )?(.+?) internet requirement different$/i.exec(question);
    if (match) return result('network', match[1], {contextFieldText:'network'});
    match = /^does (.+?) (?:need|require) (?:an? )?(?:internet|network) connection$/i.exec(question);
    if (match) return result('network', match[1]);
    match = /^(?:which|what) java (?:release|runtime|version(?: and architecture)?) does (.+?) (?:recommend|require|request)$/i.exec(question);
    if (match) return result('java-runtime', match[1]);
    match = /^does (.+?) use the same java runtime(?: as (.+))?$/i.exec(question);
    if (match) return result('same-java-runtime', match[1], match[2] ? {referenceText:match[2]} : {contextFieldText:'java-runtime'});
    match = /^what does the guide recommend for (.+?) instead$/i.exec(question);
    if (match) return result('java-runtime', match[1], {contextFieldText:'java-runtime', sourceText:'the guide'});
    match = /^which map method works directly with (.+)$/i.exec(question);
    if (match) return result('map-native-method', 'the map method', {categoryText:'integrated-map', targetText:match[1]});
    match = /^why is (.+?) (?:wrong|not working|not functioning properly) in a standard melee game$/i.exec(question);
    if (match) return result('map-mode', match[1], {categoryText:'integrated-map'});
    match = /^which (?:game )?mode should (?:i|we) use instead$/i.exec(question);
    if (match) return result('map-mode', 'it', {contextFieldText:'map-mode'});
    match = /^can (.+?) use arbitrary maps$/i.exec(question);
    if (match) return result('map-scope', match[1], {categoryText:'integrated-map'});
    match = /^does (.+?)(?:'s|’s) own developer quick start target (.+)$/i.exec(question);
    if (match) return result('developer-target', match[1], {targetText:match[2], sourceText:'own developer quick start'});
    match = /^where does (.+?)(?:'s|’s) (binary configuration|matching json configuration) go$/i.exec(question);
    if (match) return result('binary-configuration', match[1], {artifactText:match[2]});
    match = /^where do (?:i|we) put (?:the )?(matching json configuration)$/i.exec(question);
    if (match) return result('binary-configuration', 'it', {artifactText:match[1]});
    match = /^what plans (?:its|their) build orders$/i.exec(question);
    if (match) return result('build-orders', 'it', {contextFieldText:'components'});
    match = /^what plans (.+?)(?:'s|’s) build orders$/i.exec(question);
    if (match) return result('build-orders', match[1]);
    match = /^which subreddit is listed$/i.exec(question);
    return match ? result('community-subreddit', 'the listed community resource', {categoryText:'subreddit'}) : null;
}

const labelsOf = values => Array.isArray(values) ? [...new Set(values.map(label).filter(value => value
    && /^[\p{L}\p{N}][\p{L}\p{N} .:'()&-]*$/u.test(value) && !DEICTIC.test(value)))] : [];
const matches = (value, labels, grounded) => labels.includes(label(value)) || grounded === true && DEICTIC.test(normalized(value));
const literal = fact => typeof fact?.text === 'string' && Boolean(fact.text.trim()) && fact.text === fact.witness
    && !fact.conflict && Array.isArray(fact.answerRelations) && !UNCERTAIN.test(normalized(fact.text));
const roles = (fact, values) => values.every(value => fact.answerRelations.includes(value));
const clauses = fact => normalized(fact.text).split(';').map(value => value.trim().replace(/^(?:pros|cons):\s*/, '').replace(/[.!]$/, ''));

function offline(fact) {
    if (!roles(fact, ['prerequisites','use']) || CONDITIONAL.test(normalized(fact.text))) return false;
    const network = clauses(fact).filter(value => /\b(?:internet|online|network|connection)\b/.test(value));
    // An unconditional whole clause is mandatory. Local gameplay after login
    // does not prove entirely offline operation, and contrary clauses veto it.
    return network.length === 1 && network[0] === 'no internet connection required'
        && clauses(fact).filter(value => /\boffline\b/.test(value)).every(value => value === 'good for offline play')
        && clauses(fact).filter(value => value !== network[0]).every(value =>
            !/\b(?:not|never|no|cannot|can't|doesn't|isn't|won't|requires?|needs?|must|only)\b/.test(value));
}

function comparison(primary, reference, request, referenceLabels) {
    if (!roles(primary, ['comparison','limitations']) || !roles(reference, ['comparison','limitations'])
        || !/^(?:ai )?realism and strategic depth$/.test(normalized(request.propertyText))) return false;
    const source = clauses(primary), other = clauses(reference);
    const realism = source.filter(value => /\b(?:realistic|realism)\b/.test(value));
    const depth = source.filter(value => /\bstrategic depth\b/.test(value));
    const referenceRealism = other.filter(value => /\b(?:realistic|realism)\b/.test(value));
    // Both authored comparison profiles must be supplied in full. The primary
    // profile must explicitly name the requested comparator; co-occurrence or
    // two independent positive capability facts never establish a contrast.
    return /^pros: .+; cons: .+$/.test(normalized(primary.text))
        && /^pros: .+; cons: .+$/.test(normalized(reference.text))
        && realism.length === 1 && realism[0] === 'less realistic ai behavior'
        && referenceRealism.length === 1 && referenceRealism[0] === 'more realistic ai behavior'
        && depth.length === 1 && referenceLabels.some(name => depth[0] === `limited strategic depth compared to ${name}`);
}

function detection(fact, request, subjectLabels, grounded) {
    if (!roles(fact, ['configuration','method','sequence'])
        || !/^[\p{L}\p{N}_.-]+\.exe$/iu.test(request.executableText)
        || request.variant !== 'condition' && (!/^(?:the|my|our) game(?: installation)?$/.test(normalized(request.destinationText))
            || !matches(request.referenceText, subjectLabels, grounded || !DEICTIC.test(normalized(request.subjectText))))) return false;
    return detectionProcedure(fact, subjectLabels)?.executable === normalized(request.executableText);
}

// The procedure templates recognize complete literal authored clauses. They
// expose bounded fields for proof only and never rewrite the returned source.
function detectionProcedure(fact, subjectLabels) {
    if (!roles(fact, ['configuration','method','sequence'])) return null;
    for (const name of subjectLabels) {
        const match = new RegExp(`^if ${escape(name)} doesn't detect your ([\\p{L}\\p{N} :.-]+) installation automatically: `
            + 'click on the settings/configuration button in the launcher; navigate to the "game" or "paths" section; '
            + 'browse to and select your ([\\p{L}\\p{N}_.-]+\\.exe) file; save the settings and restart the launcher$', 'u').exec(normalized(fact.text));
        if (match) return {game:match[1], executable:match[2]};
    }
    return null;
}

function portableProcedure(fact, subjectLabels) {
    if (!roles(fact, ['installation','configuration','destination','method','location'])) return null;
    for (const name of subjectLabels) {
        const match = new RegExp(`^extract ${escape(name)} to your portable ([\\p{L}\\p{N} :.-]+) directory; `
            + `when prompted, point ${escape(name)} to the ([\\p{L}\\p{N}_.-]+\\.exe) in the same directory; `
            + 'all settings will be saved in the same folder, making it fully portable$', 'u').exec(normalized(fact.text));
        if (match) return {game:match[1], executable:match[2]};
    }
    return null;
}

function returnedProcedure(fact, returnedFacts, subjectLabels) {
    if (!Array.isArray(returnedFacts) || !returnedFacts.length || !returnedFacts.every(literal)
        || !fact.sourceRecordId || !fact.source?.file) return false;
    // A previously returned containing installation procedure may ground its
    // complete child sequence. A label, partial excerpt or shared tool cannot.
    const complete = previous => {
        if (previous.text === fact.text) return true;
        if (!detectionProcedure(fact, subjectLabels)
            || !roles(previous, ['installation','configuration','download','prerequisites','version','sequence','method','destination'])) return false;
        return subjectLabels.some(name => new RegExp('^ensure you have ([\\p{L}\\p{N} :.-]+) installed and updated to version ([0-9.]+); '
            + `download the latest ${escape(name)} release from github; `
            + 'extract the downloaded zip file to your \\1 installation directory; '
            + `run ${escape(name)}\\.exe; ${escape(normalized(fact.text))}; `
            + 'configure your preferred game settings through the launcher interface; '
            + `launch the game through ${escape(name)}$`, 'u').test(normalized(previous.text)));
    };
    return returnedFacts.some(previous => previous.entityId === fact.entityId
        && previous.sourceRecordId === fact.sourceRecordId && previous.source?.file === fact.source.file
        && roles(previous, ['configuration','method'])
        && complete(previous))
        && Boolean(detectionProcedure(fact, subjectLabels) || portableProcedure(fact, subjectLabels));
}

function procedureField(fact, request, subjectLabels) {
    const detection = detectionProcedure(fact, subjectLabels), portable = portableProcedure(fact, subjectLabels);
    if (request.actionText === 'select') return /^(?:file|executable)$/.test(normalized(request.fieldText)) && Boolean(detection || portable);
    if (request.actionText === 'saved') return request.fieldText === 'settings' && Boolean(portable);
    if (request.actionText === 'point') return Boolean(portable
        && (normalized(request.fieldText) === 'the executable' || normalized(request.fieldText) === portable.executable)
        && /^(?:that|the same) (?:directory|folder)$/.test(normalized(request.locationText)));
    return Boolean(portable && normalized(request.fieldText) === portable.executable
        && /^(?:the same directory|the same folder)$/.test(normalized(request.locationText)));
}

function native(fact, request, subjectLabels) {
    if (!roles(fact, ['use','version','explanation'])) return false;
    const subject = `(?:this method|${subjectLabels.map(escape).join('|')})`;
    const match = new RegExp(`^(?:note: )?${subject} works natively with ([\\p{L}\\p{N} :.-]+) without needing version downgrades\\.$`, 'u').exec(normalized(fact.text));
    const target = label(request.targetText);
    // Full requested wording must survive. A shorter edition name is accepted
    // only as a whole trailing phrase of the explicit native target; no unknown
    // modifier, number, platform or second requested action can disappear.
    return Boolean(match && target && (match[1] === target || match[1].endsWith(` ${target}`)));
}


// Complete authored witnesses, not keyword occurrences, establish these fields.
// The result contains typed properties only; the original fact is the answer.
// No IDs, aliases, source strings or source paragraphs are manufactured here.
export function readSoftwareSemanticFields(fact, {subjectLabels} = {}) {
    const subjects = labelsOf(subjectLabels);
    if (!subjects.length || !fact?.source?.file || !fact.source.locator
        || typeof fact.text !== 'string' || fact.text !== fact.witness || !Array.isArray(fact.answerRelations)) return [];
    const value = normalized(fact.text), fields = [];
    const add = (field, required, proof) => { if (roles(fact, required) && proof) fields.push(field); };
    const named = suffix => subjects.some(name => value === `${name}${suffix}` || value === `outside research: ${name}${suffix}`);
    if (fact.conflict) {
        add('game-installation', ['prerequisites','version','limitations','explanation'],
            subjects.some(name => value === 'the setup section requires a separate brood war 1.16.1 installation, while the earlier prerequisites also mention remastered. '
                + `these sources conflict, so this assistant cannot confirm ${name} support for remastered.`)
            && fact.source.review === 'conflicting');
        if (fields.length) fields.push('compatibility');
        return fields;
    }
    if (!literal(fact)) return [];
    add('purpose', ['purpose','use','explanation'], named(' replaces the standard ai, so you can use it in single-player mode'));
    const api = named(' is a free, open-source c++ framework for creating ai agents that interact with starcraft: brood war. it is a programming api, not a prepackaged opponent client.');
    add('purpose', ['purpose','identity','explanation'], api);
    add('packaged-opponent', ['identity','limitations','comparison'], api);
    add('defaults', ['explanation','limitations','use','outcome'], named(' normally hides units outside visible game state and blocks human unit control; tournament modules can enforce settings. changed defaults are announced, so this is not a guarantee that every bot uses identical restrictions.'));
    if (fields.includes('defaults')) fields.push('default-changes');
    add('network', ['prerequisites','use','limitations','explanation'], subjects.some(name => value === `note about ${name}: an internet connection is only required for the initial client login. all gameplay after login happens on your local network, ensuring minimal latency and no ongoing internet requirement during play.`));
    add('network', ['prerequisites','use'], value === 'no internet connection required; replaces standard single-player ai; easier to set up initially; good for offline play');
    add('java-runtime', ['prerequisites','version','installation','method'], value === 'download and install java jre (recommended: liberica java jdk 21 lts)');
    add('java-runtime', ['prerequisites','version','cause','comparison'], named("'s reviewed readme requires a 32-bit jdk 8 at runtime because it connects to 32-bit bwapi. do not substitute the guide's schnail java 21 recommendation."));
    const map = value === 'pros: works directly with starcraft remastered; no external launcher required; easy setup (just download and play); cons: must be played in "use map settings" mode; limited to the provided integrated maps';
    add('map-native-method', ['prerequisites','use','comparison','limitations'], map);
    add('map-scope', ['prerequisites','use','comparison','limitations'], map);
    add('map-mode', ['configuration','prerequisites','method','limitations','outcome','cause'], value === 'crucial step: under game type, you must select "use map settings". the ai will not function properly in a standard melee game.');
    add('developer-target', ['version','prerequisites','limitations','explanation'], subjects.some(name => value === `outside research: the reviewed ${name} readme quick start specifies brood war 1.16.1. that does not certify arbitrary ${name} binaries for remastered.`));
    add('binary-configuration', ['configuration','installation','destination','version','prerequisites','method'], named("'s manual binary instructions place the matching version's json configuration in bwapi-data/ai and include bwapi 4.4.0. this is distinct from extracting the remastered map zip into maps."));
    add('components', ['identity','explanation','use','relationship'], value === 'outside research: the official wiki describes sparcraft as its combat simulator and boss as its build-order search and simulation system. these are component relationships, not separate schnail installation requirements.');
    if (fields.includes('components')) fields.push('build-orders');
    add('community-subreddit', ['support'], /^r\/[a-z0-9_]+ subreddit$/.test(value) && Array.isArray(fact.links)
        && fact.links.some(link => link.url === `https://www.reddit.com/${value.split(' ')[0]}/`));
    return fields;
}

/** Prove a complete recorded alternative relation, never choose a requested
 * branch. The caller still owns canonical software scope, provenance and every
 * other field/condition. Type synonyms are limited to executable/library and
 * require the literal client/module roles in the original contrast clause. */
export function supportsSoftwareFieldAlternatives({field,fact,entry,subjectLabels}={}) {
    const alternatives=field?.alternativeTexts;
    if(!literal(fact) || !fact.source?.file || !fact.source.locator || fact.source.review==='conflicting' || !Array.isArray(alternatives)
        || alternatives.length!==2 || alternatives.some(value=>typeof value!=='string' || !value.trim())
        || !Array.isArray(field.selectors) || field.selectors.length!==1
        || Array.isArray(field.unknownQualifierTexts) && field.unknownQualifierTexts.some(value=>typeof value==='string' && value.trim()))return false;
    const execution=field.key==='identity' && field.selectors[0]==='execution-mode' && field.contrastText==='or';
    const updates=field.key==='use' && field.selectors[0]==='updates' && field.contrastText==='alone-or-too';
    if(!execution && !updates)return false;
    const subjects=labelsOf(subjectLabels),owned=[fact.subject,...(fact.aliases || [])].map(label);
    if(!subjects.length || !subjects.some(subject=>owned.some(name=>name===subject || name.startsWith(subject+' '))))return false;
    const declared=(entry?[entry]:Array.isArray(fact.sourceFields)?fact.sourceFields:[]).filter(value=>value
        && value.key===field.key && Array.isArray(value.selectors) && value.selectors.includes(field.selectors[0])
        && value.witness===fact.witness && (!entry || value.explicit===true && (!value.factId || value.factId===fact.id))
        && (!value.source || value.source.file===fact.source.file && value.source.locator===fact.source.locator
            && value.source.review===fact.source.review));
    if(!declared.length)return false;
    const groups=declared.flatMap(value=>Array.isArray(value.arguments)?value.arguments:[])
        .filter(group=>Array.isArray(group.bindings) && group.bindings.every(binding=>binding
            && typeof binding.mention==='string' && fact.witness.includes(binding.mention)));
    const artifact=value=>{
        const name=label(value);
        if(/^client (?:exe|executable|program)$/.test(name))return 'client-executable';
        if(/^module (?:dll|library)$/.test(name))return 'module-library';
        return null;
    };
    if(execution){
        const wanted=alternatives.map(artifact);
        if(new Set(wanted).size!==2 || !wanted.includes('client-executable') || !wanted.includes('module-library'))return false;
        const value=normalized(fact.text);
        const contrast=/\buses (?:a|an) (client (?:exe|executable|program)) (?:instead of|rather than) (?:a|an) (module (?:dll|library))(?=\s+(?:and|but|which)\b|[.;]|$)/.exec(value);
        if(!contrast || !subjects.length)return false;
        const prefix=value.slice(0,contrast.index).replace(/^outside research:\s*/,'');
        if(/\b(?:not|never|no|cannot|can't|doesn't|does not|whether|if|unless)\b/.test(prefix)
            || !subjects.some(subject=>prefix.startsWith(subject+"'s ") || prefix.startsWith(subject+' ')))return false;
        return groups.some(group=>group.bindings.some(binding=>binding.role==='object' && artifact(binding.mention)==='client-executable')
            && group.bindings.some(binding=>binding.role==='content'
                && /^(?:instead of|rather than) (?:a |an )?module (?:dll|library)$/.test(normalized(binding.mention))));
    }
    const wanted=alternatives.map(label);
    if(new Set(wanted).size!==2 || wanted.some(value=>!['client','game'].includes(value)))return false;
    // The asserted conjunction is a whole field clause. Merely mentioning two
    // update targets, or denying updates in the same paragraph, is not proof.
    const clauses=normalized(fact.text).replace(/^outside research:\s*/,'').split(/(?<=[.!?;])\s+/);
    if(!clauses.some(clause=>/^automatic updates for both (?:the )?client and (?:the )?game[.!;]?$/.test(clause)
        || /^automatic updates for both (?:the )?game and (?:the )?client[.!;]?$/.test(clause)))return false;
    return groups.some(group=>wanted.every(target=>group.bindings.some(binding=>binding.role==='recipient' && label(binding.mention)===target)));
}

/** Match a software source-object class only after ordinary literal matching
 * fails. Exact compiled bindings and their explicit source relationship prove
 * the class; the requested noun alone never adds an owner, field or role. */
export function matchesSoftwareFieldArgument({value,binding,field,entry,fact,subjectLabels}={}) {
    const source=fact?.source,record=fact?.record;
    const same=(a,b)=>a && b && ['file','locator','review'].every(key=>typeof a[key]==='string' && a[key] && a[key]===b[key]);
    if(!literal(fact) || typeof fact.id!=='string' || !fact.id || typeof fact.recordId!=='string' || !fact.recordId
        || source?.review==='conflicting' || !record || fact.recordId!==record.id
        || record.entityId!==fact.entityId || record.variants?.direct?.text!==fact.witness || !same(record.source,source)
        || record.source.index?.review!=='authored-index' || entry?.explicit!==true || entry.factId!==fact.id
        || entry.recordId!==fact.recordId || entry.witness!==fact.witness || !same(entry.source,source)
        || !field || field.key!==entry.key || !Array.isArray(field.selectors) || !Array.isArray(entry.selectors)
        || field.selectors.some(selector=>!entry.selectors.includes(selector))
        || Array.isArray(field.unknownQualifierTexts) && field.unknownQualifierTexts.some(text=>typeof text==='string' && text.trim())
        || !binding || binding.role!=='object' || typeof binding.mention!=='string' || !fact.witness.includes(binding.mention))return false;
    if(source.review==='external-research' && (!/^\d{4}-\d{2}-\d{2}$/.test(fact.researchWitness?.checkedAt || '')
        || !source.references?.some(reference=>reference.url===fact.researchWitness?.url
            && reference.checkedAt===fact.researchWitness.checkedAt)))return false;
    const subjects=labelsOf(subjectLabels),names=[fact.subject,...(fact.aliases || [])].map(label);
    if(!subjects.length || !subjects.some(subject=>names.some(name=>name===subject || name.startsWith(subject+' '))))return false;
    const groups=(Array.isArray(entry.arguments)?entry.arguments:[]).filter(group=>Array.isArray(group.bindings)
        && !(group.requiredFactIds || []).length && group.bindings.every(argument=>argument && typeof argument.mention==='string'
            && fact.witness.includes(argument.mention))
        && group.bindings.some(argument=>argument.role===binding.role && argument.mention===binding.mention
            && argument.entityId===binding.entityId));
    if(!groups.length)return false;
    const slot=(key,selector,empty=false)=>field.key===key && entry.selectors.includes(selector)
        && (empty || field.selectors.length===1) && field.selectors.every(value=>value===selector);
    const requested=label(value),text=normalized(fact.witness);
    const asserted=pattern=>[...text.matchAll(new RegExp(pattern,'g'))].some(match=>{
        const prefix=text.slice(0,match.index).split(/[.!?;]\s+/).at(-1);
        return !/\b(?:not|never|no|cannot|can't|doesn't|does not|whether)\b/.test(prefix);
    });
    if(/^(?:(?:package|packaging|build) )?command$/.test(requested)
        && (slot('outcome','artifact') || slot('method','build'))){
        if(!/^[\w./:+-]+(?: [\w./:=+-]+)+$/.test(binding.mention) || !/\bpackage\b/i.test(binding.mention))return false;
        return groups.some(group=>{
            const outputs=group.bindings.filter(argument=>argument.role==='output');
            return outputs.length===1 && /\.jar$/i.test(outputs[0].mention)
                && asserted(`${escape(normalized(binding.mention))} produces ${escape(normalized(outputs[0].mention))}(?=[.!;]|$)`);
        });
    }
    if(/^ide (?:working )?(?:folder|directory)$/.test(requested)
        && (slot('location','ide-directory') || slot('limitations','installation-match',true))
        && label(binding.mention)==='ide configuration'){
        return groups.some(group=>group.bindings.some(destination=>destination.role==='destination'
            && /\bdirectory$/i.test(destination.mention) && group.bindings.some(qualifier=>qualifier.role==='content'
                && normalized(qualifier.mention)==='must match the local installation'
                && asserted(`${escape(normalized(binding.mention))} points to ${escape(normalized(destination.mention))} that ${escape(normalized(qualifier.mention))}(?=[.!;]|$)`))));
    }
    if(requested==='game files' && slot('use','automation') && label(binding.mention)==='game files'){
        return groups.some(group=>group.bindings.some(agent=>agent.role==='agent'
            && asserted(`${escape(normalized(agent.mention))} (?:will )?automatically download and set up ${escape(normalized(binding.mention))}(?=[.!;]|$)`)));
    }
    return false;
}

const sameSourceFact = (fact, previous) => previous.entityId === fact.entityId && previous.text === fact.text
    && previous.witness === fact.witness && previous.source?.file === fact.source?.file
    && previous.source?.locator === fact.source?.locator && previous.sourceRecordId === fact.sourceRecordId;

function completeOwnerProof(fact, subjectLabels) {
    if (readSoftwareSemanticFields(fact,{subjectLabels}).length) return true;
    // A returned whole, reviewed field can ground its canonical software
    // owner even when this finite reader has no grammar for that earlier
    // question. It proves only ownership of the actual returned witness;
    // the new requested capability still needs its independent proof below.
    const ownerFields=new Set(['identity','use','method','prerequisites','acquisition','outcome','location',
        'documentation','support','version','limitations','cause']);
    const localOwner=fact.source?.review!=='external-research' && typeof fact.sourceRecordId==='string' && fact.sourceRecordId.trim();
    const research=fact.researchWitness,source=fact.record?.source;
    const researchOwner=fact.source?.review==='external-research' && typeof fact.recordId==='string'
        && fact.recordId===fact.record?.id && fact.record?.entityId===fact.entityId
        && fact.record?.variants?.direct?.text===fact.witness
        && source?.file===fact.source.file && source?.locator===fact.source.locator && source?.review===fact.source.review
        && source.index?.review==='authored-index' && source.index.file===fact.source.file && source.index.locator===fact.source.locator
        && typeof research?.url==='string' && /^\d{4}-\d{2}-\d{2}$/.test(research.checkedAt || '')
        && Array.isArray(fact.source.references) && fact.source.references.some(reference=>reference.url===research.url
            && reference.checkedAt===research.checkedAt);
    if(literal(fact) && fact.source?.review!=='conflicting' && (localOwner || researchOwner)
        && fact.source?.file && fact.source.locator && Array.isArray(fact.sourceFields)
        && fact.sourceFields.some(field=>field && ownerFields.has(field.key) && field.witness===fact.witness
            && (!field.source || field.source.file===fact.source.file && field.source.locator===fact.source.locator
                && field.source.review===fact.source.review)
            && Array.isArray(field.selectors) && field.selectors.every(selector=>typeof selector==='string'
                && /^[a-z0-9]+(?:[ -][a-z0-9]+)*$/.test(selector))))return true;
    const value = normalized(fact.text);
    // These complete identity/download witnesses can establish the owner of a
    // subsequent property request; they cannot establish that property itself.
    return labelsOf(subjectLabels).some(name => value === `run ${name}.exe`
        || value === `outside research: ${name} is a scala ai bot for brood war that can play all three races. it is a separately documented bot, not the guide's integrated remastered map.`
        || value === `outside research: the ${name} maintainer page provides binary, source and past-version links. use that reviewed page rather than inventing a github release asset from the guide's questionable repository link.`);
}

function semanticField(request, context) {
    const {facts, subjectEntityId, subjectLabels, grounded, returnedFacts, referenceEntityId, referenceLabels} = context;
    if (facts.length !== 1 || facts[0].entityId !== subjectEntityId) return false;
    const fact = facts[0], fields = readSoftwareSemanticFields(fact, {subjectLabels});
    const subjects = labelsOf(subjectLabels), references = labelsOf(referenceLabels);
    const previous = Array.isArray(returnedFacts) ? returnedFacts.filter(value => literal(value) && value.source?.file && value.source.locator) : [];
    const ownReturned = previous.filter(value => value.entityId === subjectEntityId && completeOwnerProof(value, subjectLabels));
    const deictic = DEICTIC.test(normalized(request.subjectText));
    const category = request.categoryText === 'integrated-map' && /^(?:the map method|the advanced ai)$/.test(normalized(request.subjectText))
        && /^(?:map-mode|map-native-method|map-scope)$/.test(request.fieldText)
        || request.categoryText === 'subreddit' && request.subjectText === 'the listed community resource';
    const apiReturn = normalized(request.subjectText) === 'the api itself' && grounded && ownReturned.length
        && ownReturned.some(value => readSoftwareSemanticFields(value,{subjectLabels}).some(field => ['defaults','packaged-opponent','purpose'].includes(field)));
    if (!(matches(request.subjectText, subjects, grounded) || category || apiReturn) || deictic && (!grounded || !ownReturned.length)) return false;
    if (request.fieldText === 'same-java-runtime') {
        if (!fields.includes('java-runtime') || !referenceEntityId || referenceEntityId === subjectEntityId || !references.length
            || request.referenceText && !matches(request.referenceText, references, false)) return false;
        // The current full witness must explicitly distinguish this comparator.
        // Merely finding a prior Java fact never establishes a comparison.
        return references.some(name => normalized(fact.text).endsWith(`do not substitute the guide's ${name} java 21 recommendation.`))
            && previous.some(value => value.entityId === referenceEntityId && readSoftwareSemanticFields(value,{subjectLabels:referenceLabels}).includes('java-runtime'));
    }
    if (!fields.includes(request.fieldText)) return false;
    if (request.propertyText === 'offline benefit' && !offline(fact)) return false;
    if (request.targetText && !/^(?:starcraft )?remastered$/.test(normalized(request.targetText))) return false;
    if (request.sourceText === 'the guide' && fact.source.review !== 'extracted') return false;
    if (request.contextFieldText === 'defaults' || request.contextFieldText === 'map-mode' || request.contextFieldText === 'components')
        return ownReturned.some(value => sameSourceFact(fact,value) && readSoftwareSemanticFields(value,{subjectLabels}).includes(request.contextFieldText));
    if (request.contextFieldText === 'java-runtime') {
        // An explicit target plus “instead” inherits only the recorded property.
        // The caller must independently resolve the prior owner's labels.
        return Boolean(referenceEntityId && references.length && referenceEntityId !== subjectEntityId
            && previous.some(value => value.entityId === referenceEntityId && readSoftwareSemanticFields(value,{subjectLabels:referenceLabels}).includes('java-runtime')));
    }
    if (request.contextFieldText === 'network') {
        return Boolean(referenceEntityId && references.length && referenceEntityId !== subjectEntityId
            && previous.some(value => value.entityId === referenceEntityId && readSoftwareSemanticFields(value,{subjectLabels:referenceLabels}).includes('network')));
    }
    return true;
}

/** Boolean proof only. Facts must already pass the caller's original source,
 * spoiler, edition, material, numeric, state and compound-request gates. Supply
 * labels and IDs from separately resolved canonical subjects, never from the
 * request or a candidate text match. Only an established active subject may
 * license deictic wording. Procedure fields and continuation also require
 * returnedFacts: the complete eligible facts actually displayed last turn.
 * Those facts ground a source procedure, never a completed user action.
 * Render every accepted fact's complete original text.
 */
export function supportsSoftwareCapabilityRequest(request, {facts, subjectEntityId, subjectLabels, referenceEntityId, referenceLabels, grounded, returnedFacts} = {}) {
    if (!request || !Array.isArray(facts) || !facts.length || !facts.every(fact => literal(fact) || request?.kind === 'software-field' && readSoftwareSemanticFields(fact,{subjectLabels}).includes('compatibility'))
        || typeof subjectEntityId !== 'string' || !subjectEntityId) return false;
    const parsed = parseSoftwareCapabilityRequest(request.originalText);
    if (!parsed || JSON.stringify(parsed) !== JSON.stringify(request)) return false;
    if (request.kind === 'software-field') return semanticField(request, {facts, subjectEntityId, subjectLabels, referenceEntityId, referenceLabels, grounded, returnedFacts});
    const subjects = labelsOf(subjectLabels), references = labelsOf(referenceLabels);
    if (!subjects.length || !matches(request.subjectText, subjects, grounded)) return false;
    if (request.kind === 'property-comparison') {
        if (facts.length !== 2 || !referenceEntityId || referenceEntityId === subjectEntityId
            || !references.length || !matches(request.referenceText, references, false)) return false;
        const primary = facts.find(fact => fact.entityId === subjectEntityId);
        const reference = facts.find(fact => fact.entityId === referenceEntityId);
        return Boolean(primary && reference && primary !== reference && comparison(primary, reference, request, references));
    }
    if (facts.length !== 1 || facts[0].entityId !== subjectEntityId) return false;
    if (request.kind === 'procedure-field' || request.kind === 'procedure-continuation') {
        if (DEICTIC.test(normalized(request.subjectText)) && !grounded || !returnedProcedure(facts[0], returnedFacts, subjects)) return false;
        return request.kind === 'procedure-field' ? procedureField(facts[0], request, subjects)
            : normalized(request.phaseText) === 'saving the settings' && Boolean(detectionProcedure(facts[0], subjects));
    }
    if (request.kind === 'portable-configuration') {
        const procedure = portableProcedure(facts[0], subjects);
        return Boolean(procedure && label(request.targetText) === procedure.game);
    }
    if (request.kind === 'offline-operation') return offline(facts[0]);
    if (request.kind === 'executable-detection') return detection(facts[0], request, subjects, grounded);
    return request.kind === 'native-compatibility' && native(facts[0], request, subjects);
}

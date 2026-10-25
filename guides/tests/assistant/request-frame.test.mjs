import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSourceRequestFrame as parse } from '../../js/assistant/request-frame.js';
const shapes = q => parse(q)?.fields.map(field => [field.key,field.selectors]);
const has = (q,key,selector) => parse(q)?.fields.some(field=>field.key===key && (!selector || field.selectors.includes(selector)));

test('coordinated named statistics remain fields of one full owner', () => {
    const q='What starting Strength, Dexterity, Intelligence and Combat does the repaired bronze sentinel have in that table?';
    const f=parse(q);
    assert.equal(f.subjectText,'the repaired bronze sentinel');
    assert.deepEqual(shapes(q),[['stats',['strength']],['stats',['dexterity']],['stats',['intelligence']],['stats',['combat']]]);
    assert.ok(f.fields.every(field=>field.subjectText===f.subjectText && field.requestedText.includes('in that table')));
    assert.equal(f.complete,true);
});

test('nominal coordination covers distinct kinds without independent owners', () => {
    assert.deepEqual(shapes('What weapon type and effect does the guide assign to that bronze hammer?'),[['identity',['type']],['use',['effect']]]);
    assert.deepEqual(shapes('What site and protective effect are listed for the repaired wand?'),[['location',[]],['use',['effect']]]);
    assert.deepEqual(shapes('How is her fighting role and main focus described?'),[['identity',['role']],['identity',['focus']]]);
});

test('a coordinate request is distinct from a location and cardinality is a request not a source value', () => {
    const f=parse('What location and coordinates are listed for the blue archive?');
    assert.deepEqual(f.fields.map(field=>field.key),['location','location']);
    assert.deepEqual(f.fields[1].selectors,['coordinates']);
    const files=parse('What working folder and three data directories are described for the client?');
    assert.ok(files.fields.some(field=>field.selectors.includes('data-directory')));
    assert.equal(files.fields.find(field=>field.selectors.includes('data-directory')).requestedCount.value,3);
    assert.equal(files.fields.find(field=>field.selectors.includes('working-directory')).requestedCount,undefined);
    assert.equal('value' in files.fields[0],false);
});

test('unknown modifiers and complete source/edition restrictions survive', () => {
    const q='According to the copper manual, what peculiar effect does the radioactive bronze wand have in the handheld edition?';
    const f=parse(q);
    assert.equal(f.originalText,q);
    assert.equal(f.subjectText,'the radioactive bronze wand');
    assert.equal(f.constraints.sourceText,'According to the copper manual');
    assert.equal(f.constraints.editionText,'in the handheld edition');
    assert.ok(f.fields[0].qualifierTexts.includes('peculiar'));
    assert.ok(f.fields[0].requestedText.includes('in the handheld edition'));
    const prefix=parse('In the unreleased edition, what effect does the bronze wand have?');
    assert.equal(prefix.constraints.editionText,'In the unreleased edition');
});

test('corrections and topical prefixes remain explicit and do not assert state', () => {
    const f=parse('Correction—I am asking about the orchard charm instead: what bonus does that item grant?');
    assert.equal(f.correction,true);
    assert.deepEqual(f.contextTexts,['I am asking about the orchard charm instead']);
    assert.equal(f.fields[0].key,'use');assert.deepEqual(f.fields[0].selectors,['bonus']);
    assert.equal(f.staticEligible,true);
    const switched=parse('Switch to the mirrored shield: what type and effect does it have?');
    assert.equal(switched.correction,true);
    assert.ok(switched.subjectCandidates.includes('Switch to the mirrored shield'));
});

test('conditions are source-read syntax rather than observations of inventory or completion', () => {
    const f=parse('Once every part is in my inventory, how do I assemble the glider?');
    assert.equal(f.constraints.conditionText,'Once every part is in my inventory');
    assert.equal(f.subjectText,'the glider');assert.equal(f.staticEligible,true);
    const after=parse('How do I use the glider after I have already collected the ropes?');
    assert.equal(after.constraints.conditionText,undefined);
    assert.match(after.fields[0].localConditionTexts[0],/after I have already collected the ropes/);
    assert.equal(after.staticEligible,true);
    assert.ok(after.fields[0].requestedText.includes('already'));
});

test('live state and reports cannot become static source facts', () => {
    for(const q of ['Where is the blue ranger in my current save?', 'How many bolts do I already have?',
        'What durability remains on my hammer right now?', 'Is the sword equipped on Mira in my save?',
        'How much will the merchant pay for everything I am carrying?', 'Have I already repaired the circuits?',
        'I already repaired the glider. Where should I take it?']){
        const f=parse(q);assert.ok(f,q);assert.equal(f.staticEligible,false,q);
    }
    assert.equal(parse('I already repaired the glider.'),null);
});

test('composition remains a separate field even beside a supported use effect', () => {
    const f=parse('What metal is the frame of the mirrored wand made from?');
    assert.equal(f.subjectText,'the frame of the mirrored wand');
    assert.deepEqual(shapes('What metal is the frame of the mirrored wand made from?'),[['composition',['metal']]]);
    const mixed=parse('What metal is the wand made from, and what effect does it have?');
    assert.deepEqual(mixed.fields.map(field=>field.key),['composition','use']);
});

test('directed roles keep requested objects and predicates without identifying people', () => {
    assert.ok(has('Who teaches the number song?','teacher'));
    assert.ok(has('Who makes the reed instrument?','creator'));
    assert.ok(has('Which merchant sells the special crystal?','provider','seller'));
    assert.ok(has('Who gets it afterward?','recipient'));
    assert.ok(has('Who do I perform it for?','recipient'));
    const mixed=parse('Who supplies the wood, how is it prepared, and who makes the instrument?');
    assert.deepEqual(mixed.fields.map(field=>field.key),['provider','method','creator']);
});

test('a price and recipient can share a request without requiring a new explicit owner', () => {
    const f=parse('What should I pay for the crystal, and who receives it afterward?');
    assert.deepEqual(f.fields.map(field=>field.key),['stats','recipient']);
    assert.deepEqual(f.fields[0].selectors,['price']);
    assert.equal(f.subjectText,'the crystal');
});

test('source actor questions retain named document content for later owner resolution', () => {
    const f=parse('What does the reviewed Aurora README say is needed to build the source, and what does the package command produce?');
    assert.equal(f.subjectText,'the reviewed Aurora README');
    assert.deepEqual(f.fields.map(field=>field.key),['prerequisites','outcome']);
    assert.ok(f.fields[0].requestedText.includes('to build the source'));
    assert.ok(f.subjectCandidates.includes('the package command'));
});

test('imperatives share the same field grammar and preserve owner/city modifiers', () => {
    const f=parse("Quote Neris's selling and buying percentages in Luma.");
    assert.equal(f.subjectText,'Neris');
    assert.deepEqual(f.fields.map(field=>field.selectors),[['selling-percentage'],['buying-percentage']]);
    assert.ok(f.fields.every(field=>field.qualifierTexts.includes('in Luma')));
    assert.ok(has('Lay out the two documented approaches for reaching the citadel.','sequence','alternatives'));
});

test('a new explicit field never replays a previous field', () => {
    assert.ok(has('Where should I look for messages about that loading failure?','location'));
    assert.deepEqual(shapes('And what placement check is specified for the client files?'),[['method',['placement-check']]]);
});

test('unknown noun conjuncts and unrecognized questions remain unresolved', () => {
    const f=parse('What effect and hidden serial number does the bronze wand have?');
    assert.equal(f.complete,false);assert.ok(f.fields.some(field=>field.key==='unknown'));
    assert.ok(f.unresolvedTexts.includes('hidden serial number'));
    const suffix=parse('What effect does the bronze wand have, and what fuselage coefficient is listed?');
    assert.equal(suffix.complete,false);assert.ok(suffix.unresolvedTexts.length);
    assert.ok(suffix.fields[0].requestedText.includes('bronze wand'));
});

test('unknown material, quantity and action suffixes are never discarded', () => {
    for(const suffix of ['without a copper key','with a radioactive reagent','in exactly two turns','according to a different manual','and erase the ledger']){
        const q=`What effect does the bronze wand have ${suffix}?`;
        const f=parse(q);assert.equal(f.originalText,q);
        assert.ok(f.fields.some(field=>field.requestedText.includes(suffix)),suffix);
    }
});

test('nonquestions, malformed input and oversized input do not become source requests', () => {
    for(const value of [null,{},'', 'The bronze wand is nearby.', 'Thanks!', 'x'.repeat(4097)])assert.equal(parse(value),null);
    assert.equal(parse('How is a stranger prepared?').fields[0].key,'method');
});

test('baseline, provenance, exactness and total qualifiers have explicit distinct semantics', () => {
    const baseline=parse('What starting Strength and base Dexterity are listed for the bronze sentinel?');
    assert.equal(baseline.fields[0].qualifiers.baselineText,'starting');
    assert.equal(baseline.fields[1].qualifiers.baselineText,'base');
    assert.equal(baseline.staticEligible,true);
    const exact=parse('Give me the exact total damage of the bronze blade.');
    assert.equal(exact.fields[0].qualifiers.exact,true);assert.equal(exact.fields[0].qualifiers.total,true);
    assert.equal('value' in exact.fields[0],false);
    const listed=parse('What documented main effect does the peculiar bronze blade have in that table?');
    assert.ok(listed.fields[0].qualifiers.provenanceTexts.includes('documented'));
    assert.ok(listed.fields[0].qualifiers.provenanceTexts.includes('main'));
    assert.equal(listed.subjectText,'the peculiar bronze blade');
    assert.ok(listed.fields[0].qualifiers.provenanceTexts.includes('in that table'));
});

test('neutral search intent preserves the owner and remains separate from source conditions', () => {
    const q='Where does the guide place the blue ranger when I go looking for her?';
    const f=parse(q);assert.equal(f.subjectText,'the blue ranger');
    assert.deepEqual(f.intentTexts,['when I go looking for her']);
    assert.equal(f.staticEligible,true);assert.equal(f.constraints.conditionText,undefined);
    assert.equal(f.originalText,q);
});

test('explicit procedure operators carry phases without deriving phases from nearby topics', () => {
    assert.equal(parse('How do I escape the burial route?').fields[0].phase,'escape');
    assert.equal(parse('How do I complete the courage trial?').fields[0].phase,'completion');
    assert.equal(parse('What starting Strength does the watchman have?').fields[0].phase,undefined);
    assert.equal(parse('For the final trial, what effect does the blade have?').fields[0].phase,undefined);
});

test('bare nominal follow-ups ask their own field rather than inheriting the previous facet', () => {
    assert.deepEqual(shapes('And its effect?'),[['use',['effect']]]);
    assert.deepEqual(shapes('Location and coordinates?'),[['location',[]],['location',['coordinates']]]);
    assert.equal(parse('Role and focus of the blue ranger?').subjectText,'the blue ranger');
    assert.equal(parse('The blue ranger has a protective effect.'),null);
});

test('the same field grammar applies to weather stations, appliances and staff records', () => {
    const station=parse('What documented location and coordinates are listed for the repaired coastal weather station?');
    assert.equal(station.subjectText,'the repaired coastal weather station');
    assert.deepEqual(station.fields.map(field=>field.key),['location','location']);
    assert.ok(station.fields[0].qualifiers.provenanceTexts.includes('documented'));
    assert.ok(station.fields.every(field=>!field.unknownQualifierTexts.includes('documented')));
    const freezer=parse('What price and warranty duration does the refurbished freezer have in the vendor table?');
    assert.equal(freezer.subjectText,'the refurbished freezer');
    assert.deepEqual(freezer.fields.map(field=>field.selectors),[['price'],['duration']]);
    assert.ok(freezer.fields[1].unknownQualifierTexts.some(value=>value.includes('warranty')));
    assert.ok(!freezer.fields[0].unknownQualifierTexts.some(value=>value.includes('warranty')));
    assert.deepEqual(shapes('How is her engineering role and main focus described?'),[['identity',['role']],['identity',['focus']]]);
});

test('nongame directed service roles and composition do not require game concepts', () => {
    const printer=parse('For the laser printer, who supplies the toner, how is it prepared, and who repairs the unit?');
    assert.deepEqual(printer.contextTexts,['For the laser printer']);
    assert.deepEqual(printer.fields.map(field=>field.key),['provider','method','creator']);
    assert.deepEqual(printer.fields[2].selectors,['repair']);
    const vessel=parse('Which metal is the insulated pressure vessel made from?');
    assert.equal(vessel.subjectText,'the insulated pressure vessel');
    assert.deepEqual(vessel.fields[0].selectors,['metal']);
});

test('a report about a physical appliance remains distinct from a conditional source procedure', () => {
    const report=parse('I already reset the printer. Where should I put the cartridge?');
    assert.equal(report.staticEligible,false);assert.equal(report.report,true);
    const conditional=parse('After I have already reset the printer, where should I put the cartridge?');
    assert.equal(conditional.staticEligible,true);
    assert.match(conditional.constraints.conditionText,/After I have already reset the printer/);
    assert.equal(conditional.originalText,'After I have already reset the printer, where should I put the cartridge?');
});

test('passive possessive metadata separates the owner and operator before scanning coordinated fields', () => {
    const f=parse('How is his fighting role and main focus described?');
    assert.equal(f.subjectText,'his');
    assert.deepEqual(f.fields.map(value=>value.selectors),[['role'],['focus']]);
    assert.ok(f.fields.every(value=>value.unknownQualifierTexts.length===0));
    assert.ok(f.fields.every(value=>!value.fieldHead.includes('his')&&!value.fieldHead.includes('described')));
    const ofOwner=parse('How are the role and focus of the robotics officer recorded?');
    assert.equal(ofOwner.subjectText,'the robotics officer');
    assert.deepEqual(ofOwner.fields.map(value=>value.selectors),[['role'],['focus']]);
    assert.ok(ofOwner.fields.every(value=>value.unknownQualifierTexts.length===0));
});

test('passive metadata operators never consume an unknown suffix or owner adjective', () => {
    const q='How are the role and focus of the unlicensed robotics officer described without a supervisor?';
    const f=parse(q);
    assert.equal(f.subjectText,'the unlicensed robotics officer');
    assert.ok(f.fields.every(value=>value.qualifierTexts.includes('without a supervisor')));
    assert.ok(f.fields.every(value=>value.unknownQualifierTexts.includes('without a supervisor')));
    assert.equal(f.originalText,q);
    const qualified=parse('How is the local service folder qualified in the alternate manual?');
    assert.equal(qualified.fields[0].key,'limitations');
    assert.equal(qualified.subjectText,'the local service folder');
    assert.ok(qualified.fields[0].unknownQualifierTexts.includes('in the alternate manual'));
});

test('imperative WH and distinguishing-field wrappers do not contaminate owner or field head', () => {
    const named=parse("Tell me what sets the robotics officer's basic damage apart.");
    assert.equal(named.subjectText,'the robotics officer');
    assert.deepEqual(named.fields.map(value=>value.selectors),[['damage']]);
    assert.deepEqual(named.fields[0].unknownQualifierTexts,[]);
    assert.equal(named.fields[0].qualifiers.distinguishing,true);
    assert.ok(named.fields[0].requestedText.startsWith('Tell me what sets'));
    const ordinary=parse("Tell me what role and focus the robotics officer has.");
    assert.equal(ordinary.subjectText,'the robotics officer');
    assert.deepEqual(ordinary.fields.map(value=>value.selectors),[['role'],['focus']]);
    assert.ok(ordinary.fields.every(value=>value.unknownQualifierTexts.length===0));
    const restricted=parse("Tell me what sets the unlicensed officer's radioactive basic damage apart.");
    assert.equal(restricted.subjectText,'the unlicensed officer');
    assert.ok(restricted.fields[0].unknownQualifierTexts.includes('radioactive'));
});

test('a passive possessive unknown property cannot collapse into the owner identity', () => {
    for(const q of ['How is his serialization checksum described?',
        'How is the checksum of the robotics officer recorded?', 'How is her checksum qualified?']){
        const f=parse(q);assert.equal(f.complete,false,q);
        assert.equal(f.fields[0].key,'unknown',q);
        assert.ok(f.unresolvedTexts.length,q);
    }
});

test('governed transformation inputs and outputs retain unknown material modifiers', () => {
    const f=parse('Who turns the iron board into reed pipes?');
    assert.equal(f.fields[0].key,'creator');assert.equal(f.subjectText,'reed pipes');
    assert.deepEqual(f.fields[0].argumentTexts,['the iron board']);
    assert.deepEqual(f.fields[0].ownerArgumentTexts,['reed pipes']);
    assert.deepEqual(f.fields[0].fullArgumentTexts,['the iron board','reed pipes']);
    assert.ok(f.fields[0].unknownQualifierTexts.includes('the iron board'));
    const source=parse('Who makes reed pipes from the radioactive bronze board?');
    assert.equal(source.subjectText,'reed pipes');
    assert.deepEqual(source.fields[0].argumentTexts,['the radioactive bronze board']);
    assert.deepEqual(source.fields[0].fullArgumentTexts,['the radioactive bronze board','reed pipes']);
    assert.ok(source.fields[0].unknownQualifierTexts.includes('the radioactive bronze board'));
    const physicalBase=parse('Who turns the base board into reed pipes?');
    assert.ok(physicalBase.fields[0].unknownQualifierTexts.includes('the base board'));
});

test('WH timing is never promoted to an assumed global condition', () => {
    for(const q of ['When should I use the sensor?', 'From when does the manual say maintenance stopped?']){
        const f=parse(q);assert.equal(f.constraints.conditionText,undefined,q);
        assert.ok(f.fields[0].requestedText.toLowerCase().includes('when'),q);
    }
    const f=parse('Who supplies the key, and what condition should I meet before asking?');
    assert.equal(f.constraints.conditionText,undefined);
    assert.equal(f.fields[0].localConditionTexts,undefined);
    assert.deepEqual(f.fields[1].localConditionTexts,['before asking']);
});

test('personal AUX scaffolding does not become an owner while real arguments survive', () => {
    for(const q of ['Which word do I use?', 'Which topics do I mention?'])assert.equal(parse(q).subjectText,null,q);
    const f=parse('Which spell do I use the iron key with?');
    assert.ok(f.fields[0].argumentTexts.some(value=>value.includes('iron key')));
    assert.ok(f.fields[0].unknownQualifierTexts.some(value=>value.includes('iron key')));
});

test('source-row and passive source-record owners retain the actual possessive owner', () => {
    assert.equal(parse("What selling percentage does Neris's table row give?").subjectText,'Neris');
    assert.equal(parse('What motive do his character notes give?').subjectText,'his');
    assert.equal(parse('What location is given in her profile?').subjectText,'her');
    assert.equal(parse('What motive do his falsified character notes give?').subjectText,'his falsified character notes');
});

test('numeric list requests bind cardinality only to their own list field and retain totals separately', () => {
    const dirs=parse('Give the working folder and three data directories for the client.');
    assert.equal(dirs.fields[0].requestedCount,undefined);
    assert.equal(dirs.fields[1].requestedCount.value,3);
    assert.equal(dirs.fields[1].requestedCount.scope,'requested-list');
    assert.ok(dirs.fields.every(value=>!value.unknownQualifierTexts.includes('three')));
    const roster=parse('Give the six names and the later replacement for the operator.');
    assert.equal(roster.fields[0].requestedCount.value,6);assert.equal(roster.fields[1].requestedCount,undefined);
    const total=parse('Give the exact total damage of the tool.');
    assert.equal(total.fields[0].qualifiers.total,true);assert.equal(total.fields[0].requestedCount,undefined);
    assert.equal('value' in total.fields[0],false);
});

test('personal timing predicates retain the named object but never a synthetic I-use owner', () => {
    const planned=parse('When should I use the bronze sensor?');
    assert.equal(planned.subjectText,'the bronze sensor');
    assert.deepEqual(planned.fields[0].argumentTexts,[]);
    assert.deepEqual(planned.fields[0].ownerArgumentTexts,['the bronze sensor']);
    assert.equal(planned.staticEligible,true);
    assert.equal(parse('When did I use the bronze sensor?').staticEligible,false);
});

test('generic copulas retain full exact identity candidates despite field words inside names', () => {
    const plain=parse('What is the observatory?');
    assert.equal(plain.subjectText,'the observatory');
    assert.equal(plain.identityCandidateText,'the observatory');
    assert.equal(plain.requiresExactIdentity,true);
    assert.equal(plain.fields[0].key,'identity');
    const named=parse('What is Combat Ledger?');
    assert.equal(named.identityCandidateText,'Combat Ledger');
    assert.ok(named.subjectCandidates.includes('Combat Ledger'));
    assert.equal(parse('Who is the night operator?').identityCandidateText,'the night operator');
    assert.equal(parse('What is the radioactive observatory?').identityCandidateText,'the radioactive observatory');
});

test('explicit possessive and of-field governors cannot become a neighboring owner identity', () => {
    for(const q of ["What is the operator's hidden checksum?", 'What is the checksum of the operator?']){
        const f=parse(q);assert.equal(f.identityCandidateText,undefined,q);
        assert.equal(f.fields[0].key,'unknown',q);assert.equal(f.complete,false,q);
    }
    const metal=parse('What is the metal of the radioactive shield?');
    assert.equal(metal.identityCandidateText,undefined);
    assert.equal(metal.fields[0].key,'composition');
    assert.equal(metal.subjectText,'the radioactive shield');
    assert.equal(parse('What is the Tower of Glass?').identityCandidateText,'the Tower of Glass');
});

test('installation, acquisition and download verbs are operators rather than owners', () => {
    const install=parse('How do I install the telemetry client?');
    assert.equal(install.subjectText,'the telemetry client');assert.equal(install.fields[0].key,'method');
    const get=parse('How do I get the ceramic sensor?');
    assert.equal(get.subjectText,'the ceramic sensor');assert.equal(get.fields[0].key,'acquisition');
    const download=parse('Where do I download the telemetry client?');
    assert.equal(download.subjectText,'the telemetry client');assert.equal(download.fields[0].key,'acquisition');
    assert.deepEqual(download.fields[0].selectors,['download']);
    const unknown=parse('How do I install the radioactive telemetry client without a registry key?');
    assert.equal(unknown.subjectText,'the radioactive telemetry client without a registry key');
    assert.ok(unknown.fields[0].requestedText.includes('without a registry key'));
});

test('an owner-equivalent argument is retained as owner scope rather than duplicated as an unknown field qualifier', () => {
    for(const q of ['How do I use the ceramic sensor?', 'Who supplies the wood?', 'Who teaches the tune?']){
        const f=parse(q),value=f.fields[0];assert.ok(value.ownerArgumentTexts.length,q);
        assert.deepEqual(value.argumentTexts,[],q);assert.deepEqual(value.unknownQualifierTexts,[],q);
        assert.ok(value.fullArgumentTexts.length,q);
    }
    const modified=parse('How do I use the radioactive ceramic sensor?');
    assert.equal(modified.subjectText,'the radioactive ceramic sensor');
    assert.ok(modified.fields[0].ownerArgumentTexts.includes('the radioactive ceramic sensor'));
    const input=parse('Who turns the iron board into reed pipes?');
    assert.deepEqual(input.fields[0].argumentTexts,['the iron board']);
    assert.ok(input.fields[0].unknownQualifierTexts.includes('the iron board'));
});

test('unmatched locative search syntax defers intact rather than licensing a generic item location', () => {
    assert.equal(parse('Where in that room should I search for the plans?'),null);
    assert.equal(parse('Where inside the locked cabinet can I search for the ledger?'),null);
    const compound=parse('Where within that room should I search for the ledger, and what effect does the sensor have?');
    assert.equal(compound.complete,false);assert.ok(compound.unresolvedTexts.some(value=>value.includes('within that room')));
});

test('location noun governors and accompaniment predicates separate references from field scaffolding', () => {
    const recruit=parse('Where is her recruitment meeting place listed?');
    assert.equal(recruit.subjectText,'her');assert.deepEqual(recruit.fields[0].selectors,['recruitment']);
    assert.deepEqual(recruit.fields[0].unknownQualifierTexts,[]);
    const hidden=parse('Where is her hidden recruitment meeting place listed?');
    assert.equal(hidden.subjectText,'her');assert.ok(hidden.fields[0].unknownQualifierTexts.includes('hidden'));
    const penalties=parse('What penalties come with that appliance?');
    assert.equal(penalties.subjectText,'that appliance');assert.deepEqual(penalties.fields[0].selectors,['penalty']);
    assert.deepEqual(penalties.fields[0].unknownQualifierTexts,[]);
    assert.equal(parse('What penalties come with the radioactive appliance?').subjectText,'the radioactive appliance');
});

test('ordinary combat operators have a combat field rather than a generic procedure', () => {
    for(const action of ['fight','battle','attack','defeat','counter']){
        const f=parse(`How do I ${action} it?`);
        assert.equal(f.subjectText,'it',action);assert.equal(f.fields[0].key,'combat',action);
        assert.deepEqual(f.fields[0].selectors,[],action);
    }
});

test('of-field governors bind an entire possessive object and title possessives remain exact identity candidates', () => {
    const weight=parse("What is the weight of Neris's pressure vessel?");
    assert.equal(weight.subjectText,"Neris's pressure vessel");assert.equal(weight.fields[0].key,'stats');
    assert.deepEqual(weight.fields[0].selectors,['weight']);
    const checksum=parse("What is the checksum of the operator's sensor?");
    assert.equal(checksum.subjectText,"the operator's sensor");assert.equal(checksum.fields[0].key,'unknown');
    assert.equal(parse("What is Neris's Observatory?").identityCandidateText,"Neris's Observatory");
    assert.equal(parse('Who is he?').requiresExactIdentity,undefined);
    assert.equal(parse('Who is he?').fields[0].requiresExactIdentity,false);
});

test('unknown WHO predicates cannot default to a provider or erase their governed scope', () => {
    for(const q of ['Who am I rescuing on the radioactive coastal reef?',
        'Who am I supposed to escort to the radioactive exit?', 'Who hears the performance to award the certificate?',
        'Who remotely calibrates the radioactive sensor?'])assert.equal(parse(q),null,q);
    const compound=parse('Where is the sensor, and who remotely calibrates it in the alternate facility?');
    assert.equal(compound.complete,false);
    assert.ok(compound.unresolvedTexts.some(value=>value.includes('alternate facility')));
});

test('creation and authorship governors request creators rather than generic providers', () => {
    for(const verb of ['created','made','wrote','developed','authored','designed']){
        const f=parse(`Who ${verb} the telemetry client?`);
        assert.equal(f.fields[0].key,'creator',verb);assert.equal(f.subjectText,'the telemetry client',verb);
        assert.ok(f.fields[0].requestedText.includes(verb));
    }
});

test('bare conversational speech defers intact while explicit keyword fields remain typed', () => {
    for(const q of ['What do I tell her manager?', 'What do I say to get that approval?',
        'What should I ask him about?', 'What do I mention for the permit?'])assert.equal(parse(q),null,q);
    const compound=parse('Where do I find her manager, and what do I say to get that approval?');
    assert.equal(compound,null);
    assert.deepEqual(shapes('Which keyword do I mention?'),[['method',['keyword']]]);
});

test('an unknown operation cannot silently become a supported generic method', () => {
    for(const q of ['How do I quantum-calibrate the sensor?', 'What do I transmogrify the paperwork with?',
        'How do I teleport the archive without power?'])assert.equal(parse(q),null,q);
    assert.equal(parse('What does the chest contain?'),null);
    assert.equal(parse('How do I assemble the glider?').fields[0].key,'method');
});

test('possessive concrete location referents defer to directed role resolution', () => {
    assert.equal(parse('Where do I find her mother?'),null);
    assert.equal(parse('Where is his supervisor?'),null);
    assert.equal(parse('Where are its settings saved?'),null);
    assert.equal(parse('Where is her recruitment meeting place listed?').subjectText,'her');
    assert.equal(parse('Where is the supervisor?').subjectText,'the supervisor');
});

test('display wrappers cannot become unknown properties or consume real qualifiers', () => {
    const f=parse('What damage line and exact weight column does the table assign to the amber tool?');
    assert.deepEqual(f.fields.map(v=>[v.key,v.selectors]),[['stats',['damage']],['stats',['weight']]]);
    assert.deepEqual(f.fields[0].metadataTexts,['line']);
    assert.deepEqual(f.fields[1].metadataTexts,['column']);
    assert.equal(f.fields[1].qualifiers.exact,true);
    assert.equal(f.fields[0].unknownQualifierTexts.length,0);
    const unknown=parse('What radioactive damage line does the table assign to the amber tool?');
    assert.ok(unknown.fields[0].unknownQualifierTexts.includes('radioactive'));
    assert.equal(parse('What secret ledger line does the table assign to the tool?').complete,false);
});

test('governed person fields expose full grammatical objects without canonicalizing their owners', () => {
    for(const [q,key,role,obj] of [
        ['Who teaches the peculiar number song?','teacher','content','the peculiar number song'],
        ['Who provides the radioactive timber?','provider','object','the radioactive timber'],
        ['Who created the amber instrument?','creator','output','the amber instrument'],
        ['Who do I perform the amber song for?','recipient','content','the amber song']]){
        const f=parse(q);assert.equal(f.fields[0].key,key,q);
        assert.equal(f.fields[0].objectRole,role,q);assert.deepEqual(f.fields[0].objectTexts,[obj],q);
        assert.ok(f.fields[0].requestedText.includes(obj));
    }
    const transformed=parse('Who turns the radioactive plank into an amber flute?');
    assert.deepEqual(transformed.fields[0].objectTexts,['an amber flute']);
    assert.ok(transformed.fields[0].unknownQualifierTexts.includes('the radioactive plank'));
    assert.equal(parse('Who rescues the worker on the radioactive island?'),null);
});

test('crossing purposes remain independently required scopes rather than owner suffixes', () => {
    const f=parse('Beyond the gate, how do I cross the broken bridges to pick it up?');
    assert.equal(f.subjectText,'the broken bridges');
    assert.deepEqual(f.fields[0].selectors,['cross']);
    assert.deepEqual(f.fields[0].purposeTexts,['to pick it up']);
    assert.ok(f.fields[0].unknownQualifierTexts.includes('to pick it up'));
    assert.deepEqual(f.fields[0].objectTexts,['the broken bridges']);
    assert.deepEqual(f.contextTexts,['Beyond the gate']);
    const restricted=parse('How do I cross the bridges to collect exactly two radioactive parcels?');
    assert.deepEqual(restricted.fields[0].purposeTexts,['to collect exactly two radioactive parcels']);
    assert.ok(restricted.fields[0].requestedText.includes('exactly two radioactive'));
});

test('inverse opening questions request a method instrument and retain the complete target', () => {
    const f=parse('At the archive, what opens the reinforced amber door?');
    assert.deepEqual(f.fields[0].selectors,['open']);assert.equal(f.fields[0].key,'method');
    assert.equal(f.fields[0].objectRole,'object');
    assert.deepEqual(f.fields[0].objectTexts,['the reinforced amber door']);
    assert.equal(f.fields[0].governorText,'opens');
    assert.equal(parse('What mysteriously dissolves the reinforced door?').complete,false);
});

test('named document actors are independent of the property target and retain unknown provenance', () => {
    const f=parse('What damage line does the revised amber manual assign to the bronze tool?');
    assert.equal(f.subjectText,'the bronze tool');
    assert.equal(f.fields[0].sourceActorText,'the revised amber manual');
    const build=parse('What does the reviewed Aurora README say is needed to build the source?');
    assert.deepEqual(build.fields[0].selectors,['condition']);
    assert.equal(build.fields[0].sourceActorText,'the reviewed Aurora README');
    assert.ok(build.fields[0].actionText.includes('to build the source'));
    assert.equal(parse("What motive do his character notes give?").subjectText,'his');
});

test('bounded placement ellipsis retains separate full objects and exact original fragments', () => {
    const q='Which side gets the amber lens and which gets the radioactive blue lens?';
    const f=parse(q);assert.equal(f.complete,true);
    assert.deepEqual(f.fields.map(v=>v.selectors),[['placement'],['placement']]);
    assert.deepEqual(f.fields[0].objectTexts,['the amber lens']);
    assert.deepEqual(f.fields[1].objectTexts,['the radioactive blue lens']);
    assert.equal(f.fields[1].requestedText,'which gets the radioactive blue lens');
    assert.equal(f.fields[1].inheritedFieldText,'side');
    const unsupported=parse('Which side gets the amber lens and which silently removes the ledger?');
    assert.equal(unsupported.complete,false);
});

test('software semantic heads retain distinct selectors rather than borrowing nearby phases', () => {
    assert.deepEqual(shapes('What placement check is specified for the files?'),[['method',['placement-check']]]);
    assert.deepEqual(shapes('What execution mode and restart limit are described for the worker?'),[['identity',['execution-mode']],['limitations',['restart']]]);
    assert.deepEqual(shapes('What IDE folder and maintenance status are listed for the client?'),[['location',['ide-directory']],['limitations',['maintenance']]]);
    assert.deepEqual(shapes('What toolchain policy is documented for the project?'),[['support',['toolchain-policy']]]);
    const travel=parse('What practical travel benefit does the amber cloak provide?');
    assert.deepEqual(travel.fields[0].selectors,['travel']);
    assert.deepEqual(travel.fields[0].presentationTexts,['practical']);
    assert.ok(parse('What radioactive travel benefit does the cloak provide?').fields[0].unknownQualifierTexts.includes('radioactive'));
});

test('modal passive metadata and support governors separate complete owners from operators', () => {
    const guidance=parse('How should its toolchain guidance be treated?');
    assert.equal(guidance.subjectText,'its');
    assert.deepEqual(guidance.fields[0].selectors,['toolchain-policy']);
    assert.equal(guidance.fields[0].governorText,'treated');
    const restricted=parse('How should its radioactive toolchain guidance be treated without a license?');
    assert.ok(restricted.fields[0].unknownQualifierTexts.includes('radioactive'));
    assert.ok(restricted.fields[0].unknownQualifierTexts.includes('without a license'));
    assert.equal(parse('Where does that project invite questions?').subjectText,'that project');
    assert.equal(parse('Where does that radioactive project invite questions?').subjectText,'that radioactive project');
    assert.equal(parse('How should its unknown serial checksum be treated?').complete,false);
});

test('explicit alternatives preserve every option without selecting a branch or polarity', () => {
    const execution=parse('In the reviewed amber manual, is execution through a client program or a module library?');
    assert.equal(execution.complete,true);
    assert.deepEqual(execution.fields[0].selectors,['execution-mode']);
    assert.deepEqual(execution.fields[0].alternativeTexts,['a client program','a module library']);
    assert.equal(execution.fields[0].contrastText,'or');
    assert.deepEqual(execution.contextTexts,['In the reviewed amber manual']);
    assert.equal('selectedAlternative' in execution.fields[0],false);
    const updates=parse('Are automatic updates described for the client alone, or for the radioactive game too?');
    assert.deepEqual(updates.fields[0].selectors,['updates']);
    assert.deepEqual(updates.fields[0].alternativeTexts,['the client','the radioactive game']);
    assert.equal(updates.fields[0].contrastText,'alone-or-too');
    assert.equal(updates.subjectText,null);
    const unknown=parse('Is the hidden checksum through a copper program or a silver program?');
    assert.equal(unknown.complete,false);
    assert.ok(parse('Are radioactive automatic updates for the client alone or the game too?').fields[0].unknownQualifierTexts.includes('radioactive'));
    const state=parse('Is current execution through my client program or my module library?');
    assert.equal(state.staticEligible,false);
    const suffixed=parse('Is execution through a client program or a module library without the copper adapter?');
    assert.equal(suffixed.fields[0].alternativeTexts[1],'a module library without the copper adapter');
});

test('reflexives normalize only complete known references and remain display metadata', () => {
    const f=parse('What setup work does the client itself perform on the files?');
    assert.equal(f.subjectText,'the client');assert.deepEqual(f.fields[0].metadataTexts,['itself']);
    assert.ok(f.fields[0].unknownQualifierTexts.includes('on the files'));
    assert.equal(parse('What effect does that radioactive client itself provide?').subjectText,'that radioactive client itself');
    assert.equal(parse('What effect does Neris herself provide?').subjectText,'Neris herself');
    assert.equal(parse('What role does he himself have?').subjectText,'he');
});

test('reward completion and approach wrappers expose targets but retain the whole purpose', () => {
    const reward=parse('What reward is listed for finishing that errand?');
    assert.equal(reward.subjectText,'that errand');
    assert.deepEqual(reward.fields[0].purposeTexts,['finishing that errand']);
    assert.equal(reward.fields[0].governorText,'finishing');
    const routes=parse('Lay out the two documented approaches for reaching the radioactive amber citadel.');
    assert.equal(routes.subjectText,'the radioactive amber citadel');
    assert.deepEqual(routes.fields[0].purposeTexts,['reaching the radioactive amber citadel']);
    assert.equal(routes.fields[0].requestedCount.value,2);
    assert.equal(parse('What reward is listed for finishing the radioactive errand?').subjectText,'finishing the radioactive errand');
    assert.equal(parse('What damage is listed for reaching the citadel?').subjectText,'reaching the citadel');
});

test('property-governed treating and using retain the full comparison and unknown object modifiers', () => {
    for(const governor of ['treating','using']){
        const q=`What is the danger of ${governor} the radioactive amber spell as a normal field spell?`;
        const f=parse(q);assert.equal(f.subjectText,'the radioactive amber spell');
        assert.equal(f.fields[0].governorText,governor);
        assert.ok(f.fields[0].unknownQualifierTexts.includes('as a normal field spell'));
        assert.deepEqual(f.fields[0].purposeTexts,[`${governor} the radioactive amber spell as a normal field spell`]);
        assert.equal(f.originalText,q);
    }
    const unknown=parse('What danger is described for treating the amber spell as a radioactive cobalt reagent?');
    assert.ok(unknown.fields[0].unknownQualifierTexts.includes('as a radioactive cobalt reagent'));
    assert.equal(parse('What danger is described for misclassifying the amber spell as a tool?').subjectText,'misclassifying the amber spell as a tool');
    assert.equal(parse('What damage is described for using the amber spell as a normal tool?').subjectText,'using the amber spell as a normal tool');
    assert.equal(parse('What danger is described for using my current spell as a tool?').staticEligible,false);
});

test('source-required locations retain target, source actor and every caveat', () => {
    const f=parse('What motive do his character notes give, and where do they mark him as required?');
    assert.equal(f.fields[0].sourceActorText,'his character notes');
    assert.equal(f.fields[0].subjectText,'his');
    assert.equal(f.fields[1].key,'location');assert.deepEqual(f.fields[1].selectors,['required']);
    assert.equal(f.fields[1].sourceActorText,'they');assert.equal(f.fields[1].subjectText,'him');
    assert.equal(f.fields[1].governorText,'mark as required');
    assert.equal(f.fields[1].objectRole,undefined);
    const restricted=parse('Where does the radioactive manual mark that worker as required in exactly two scenes without the copper badge?');
    assert.equal(restricted.fields[0].sourceActorText,'the radioactive manual');
    assert.equal(restricted.fields[0].subjectText,'that worker');
    assert.ok(restricted.fields[0].unknownQualifierTexts.some(v=>v.includes('two scenes without the copper badge')));
    assert.equal(restricted.fields[0].qualifiers.exact,true);
    assert.equal(parse('Where do the unknown spectators mark him as required?'),null);
    assert.equal(parse('Where do they mark him as optional?'),null);
    assert.deepEqual(parse('Where is that worker?').fields[0].selectors,[]);
    assert.equal(parse('Where do they mark my current worker as required?').staticEligible,false);
});

test('answer-beneficiary governors retain the complete obstacle as a directed object scope', () => {
    for(const verb of ['gets','takes','leads']){
        const f=parse(`What answer ${verb} me past the amber automaton?`);
        assert.deepEqual(f.fields[0].selectors,['riddle-answer']);
        assert.deepEqual(f.fields[0].objectTexts,['the amber automaton']);
        assert.equal(f.fields[0].objectRole,'object');
        assert.equal(f.fields[0].governorText,`${verb} me past`);
        assert.deepEqual(f.fields[0].unknownQualifierTexts,[]);
        assert.equal(f.subjectText,null);
    }
    const restricted=parse('What secret answer gets us past the radioactive amber automaton without the copper token?');
    assert.ok(restricted.fields[0].unknownQualifierTexts.includes('secret'));
    assert.deepEqual(restricted.fields[0].objectTexts,['the radioactive amber automaton without the copper token']);
    assert.equal(parse('What weapon gets me past the automaton?').fields[0].objectTexts,undefined);
    assert.equal(parse('What answer gets me past my current opponent?').staticEligible,false);
});

test('a final replacement-for governor does not assign its object to earlier coordinated fields', () => {
    const f=parse('For the expedition, give the six names and the later replacement for that worker.');
    assert.equal(f.fields[0].subjectMode,'topic');assert.equal(f.fields[0].subjectText,undefined);
    assert.equal(f.fields[0].requestedCount.value,6);
    assert.equal(f.fields[1].subjectText,'that worker');
    assert.deepEqual(f.fields[1].selectors,['replacement']);
    assert.deepEqual(f.contextTexts,['For the expedition']);
    assert.ok(f.fields[1].unknownQualifierTexts.includes('later'));
    const unknown=parse('Give names and the radioactive replacement for that unfamiliar worker.');
    assert.equal(unknown.fields[0].subjectMode,'topic');
    assert.equal(unknown.fields[1].subjectText,'that unfamiliar worker');
    assert.ok(unknown.fields[1].unknownQualifierTexts.includes('radioactive'));
    const ordinary=parse('Give the strength and dexterity for that worker.');
    assert.ok(ordinary.fields.every(value=>value.subjectText==='that worker'&&value.subjectMode===undefined));
    assert.ok(parse('Give the replacement for that worker.').fields.every(value=>value.subjectMode===undefined));
});

test('indirect source transport separates source actor and full object while retaining every tail', () => {
    for(const verb of ['take','bring','return','deliver']){
        const f=parse(`Where does the amber guide tell me to ${verb} the parcel?`);
        assert.equal(f.subjectText,'the parcel');
        assert.deepEqual(f.fields[0].objectTexts,['the parcel']);assert.equal(f.fields[0].objectRole,'object');
        assert.equal(f.fields[0].sourceActorText,'the amber guide');
        assert.equal(f.fields[0].governorText,`tell me to ${verb}`);
    }
    const restricted=parse('After the review, where does the radioactive manual tell us to take the amber parcel without the silver badge to the copper office?');
    assert.equal(restricted.subjectText,'the amber parcel');
    assert.ok(restricted.fields[0].unknownQualifierTexts.includes('without the silver badge to the copper office'));
    assert.equal(restricted.fields[0].sourceActorText,'the radioactive manual');
    assert.equal(restricted.constraints.conditionText,'After the review');
    assert.equal(parse('Where does the guide tell me to vaporize the parcel?'),null);
    assert.equal(parse('Where do unknown spectators tell me to take the parcel?'),null);
});

test('modal opening properties preserve the owner, requested target category and all action objects', () => {
    for(const modal of ['supposed','intended','meant']){
        const f=parse(`What passage is the amber key ${modal} to open?`);
        assert.equal(f.subjectText,'the amber key');assert.deepEqual(f.fields[0].selectors,['effect']);
        assert.equal(f.fields[0].governorText,`${modal} to open`);
        assert.ok(f.fields[0].unknownQualifierTexts.includes('passage'));
    }
    const qualified=parse('What radioactive door is the amber key meant to open without the silver badge?');
    assert.ok(qualified.fields[0].unknownQualifierTexts.includes('radioactive door'));
    assert.ok(qualified.fields[0].unknownQualifierTexts.includes('without the silver badge'));
    const explicit=parse('What passage is the amber key meant to open the unknown silver door?');
    assert.deepEqual(explicit.fields[0].objectTexts,['the unknown silver door']);
    assert.ok(explicit.fields[0].unknownQualifierTexts.includes('the unknown silver door'));
    assert.notEqual(parse('What checksum is the amber key meant to open?').subjectText,'the amber key');
    const ordinaryOutcome=parse('What outcome does the reward field list for finishing that errand?');
    assert.equal(ordinaryOutcome.subjectText,'that errand');
    assert.deepEqual(ordinaryOutcome.fields[0].purposeTexts,['finishing that errand']);
    assert.equal(ordinaryOutcome.fields[0].sourceActorText,'the reward field');
});

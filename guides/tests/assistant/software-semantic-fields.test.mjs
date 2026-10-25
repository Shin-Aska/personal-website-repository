import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseSoftwareCapabilityRequest as parse, supportsSoftwareCapabilityRequest as supports, readSoftwareSemanticFields as readFields} from '../../js/assistant/software-capabilities.js';

const manifest = JSON.parse(await readFile(new URL('../../data/assistant/knowledge/starcraft.json',import.meta.url),'utf8'));
const fact = suffix => manifest.facts.find(value => value.id === `starcraft:knowledge:${suffix}`);
const owner = id => manifest.entities.find(entity => entity.id === id);
const labels = id => { const entity = owner(id); return [entity.name,...entity.aliases]; };
const context = (suffix,extra={}) => {
    const value = fact(suffix);
    assert.ok(value, `Complete existing source ${suffix}`);
    return {facts:[value],subjectEntityId:value.entityId,subjectLabels:labels(value.entityId),...extra};
};
const followup = (suffix,prior=suffix,extra={}) => context(suffix,{grounded:true,returnedFacts:[fact(prior)],...extra});
const reference = (suffix,prior) => followup(suffix,prior,{referenceEntityId:fact(prior).entityId,referenceLabels:labels(fact(prior).entityId)});
const check = (text,proof) => supports(parse(text),proof);
const replace = (original,text) => ({...original,text,witness:text});

const cases = [
    ['What is BWAILauncher used for?','bwai-identity',context('bwai-identity'),'purpose'],
    ['What is BWAPI used for?','bwapi-identity',context('bwapi-identity'),'purpose'],
    ['Does BWAPI let bots see units outside visible state by default?','bwapi-visibility',context('bwapi-visibility'),'defaults'],
    ['Can those defaults be changed?','bwapi-visibility',followup('bwapi-visibility'),'default-changes'],
    ['Is the API itself a packaged opponent client?','bwapi-identity',followup('bwapi-identity','bwapi-visibility'),'packaged-opponent'],
    ['What about the BWAILauncher game installation?','bwai-conflict',context('bwai-conflict'),'game-installation'],
    ['So has BWAILauncher Remastered compatibility been established?','bwai-conflict',context('bwai-conflict'),'compatibility'],
    ['Which offline benefit does BWAILauncher offer?','bwai-offline',context('bwai-offline'),'network'],
    ['How is the SCHNAIL internet requirement different?','schnail-network',reference('schnail-network','bwai-offline'),'network'],
    ['Which Java release does SCHNAIL recommend?','schnail-java',context('schnail-java'),'java-runtime'],
    ['Which Java runtime does it require?','purplewave-java',followup('purplewave-java','purplewave-identity'),'java-runtime'],
    ['Does PurpleWave use the same Java runtime?','purplewave-java',reference('purplewave-java','schnail-java'),'same-java-runtime'],
    ['What does the guide recommend for SCHNAIL instead?','schnail-java',reference('schnail-java','purplewave-java'),'java-runtime'],
    ['Which map method works directly with Remastered?','map-launcher',context('map-launcher'),'map-native-method'],
    ['Why is the advanced AI wrong in a standard Melee game?','map-game-type',context('map-game-type'),'map-mode'],
    ['Which mode should I use instead?','map-game-type',followup('map-game-type'),'map-mode'],
    ['Can the map method use arbitrary maps?','map-limitations',context('map-limitations'),'map-scope'],
    ['Does BWAPI’s own developer quick start target Remastered?','bwapi-1161',context('bwapi-1161'),'developer-target'],
    ['Where does Steamhammer’s binary configuration go?','steamhammer-config',context('steamhammer-config'),'binary-configuration'],
    ['Where do I put the matching JSON configuration?','steamhammer-config',followup('steamhammer-config','steamhammer-download'),'binary-configuration'],
    ['What plans its build orders?','ualberta-components',followup('ualberta-components'),'build-orders'],
    ['Which subreddit is listed?','broodwar-community',context('broodwar-community'),'community-subreddit']
];

test('Source-present semantic fields answer the complete reviewed request with whole witnesses', () => {
    for (const [question,suffix,proof,field] of cases) {
        const descriptor = parse(question);
        assert.equal(descriptor.kind,'software-field',question);
        assert.equal(descriptor.fieldText,field,question);
        assert.equal(Object.isFrozen(descriptor),true);
        assert.equal(check(question,proof),true,question);
        const original = fact(suffix);
        assert.equal(proof.facts[0].text,original.witness);
        assert.ok(readFields(original,{subjectLabels:proof.subjectLabels}).length,question);
    }
});

test('Each field requires complete original source qualification and canonical ownership', () => {
    for (const [question,,proof] of cases) {
        const original = proof.facts[0];
        const negative = [
            {...proof,subjectEntityId:'unrelated-owner'},
            {...proof,facts:[{...original,witness:original.text.slice(0,-1)}]},
            {...proof,facts:[replace(original,original.text.slice(0,-1))]},
            {...proof,facts:[replace(original,original.text+' This also works universally.')]},
            {...proof,facts:[{...original,answerRelations:[]}]},
            {...proof,facts:[{...original,source:undefined}]},
            {...proof,facts:[{...original,source:{...original.source,locator:undefined}}]},
            {...proof,facts:[original,original]}
        ];
        for (const candidate of negative) assert.equal(check(question,candidate),false,`${question}: missing full field proof`);
        assert.equal(supports({...parse(question),fieldText:'invented-property'},proof),false,question);
    }
});

test('Purpose cannot be replaced by invocation, API classification by identity co-occurrence, or network by Java', () => {
    assert.equal(check('What is BWAILauncher used for?',context('bwai-executable')),false);
    assert.equal(check('What is BWAILauncher used for?',context('bwai-install')),false);
    assert.equal(check('Is BWAPI a packaged opponent client?',context('bwapi-identity')),true);
    assert.equal(check('Is BWAPI a packaged opponent client?',context('bwapi-releases')),false);
    assert.equal(check('Does SCHNAIL need an internet connection?',context('schnail-java')),false);
    assert.equal(check('Does SCHNAIL need an internet connection?',context('schnail-network')),true);
    assert.equal(check('Does BWAILauncher need an internet connection?',context('bwai-offline')),true);
    assert.equal(check('Which offline benefit does SCHNAIL offer?',context('schnail-network')),false);
    assert.equal(check('Which offline benefit does BWAILauncher offer?',context('bwai-executable')),false);
    assert.equal(check('How is the SCHNAIL internet requirement different?',reference('schnail-network','schnail-java')),false);
    assert.equal(check('Which subreddit is listed?',context('bwapi-community')),false);
});

test('Ellipsis is grounded only by complete evidence actually returned, including practical related-source quotes', () => {
    const contextual = cases.filter(([question]) => /those defaults|API itself|internet requirement different|runtime\?|instead\?|matching JSON|its build orders/.test(question));
    for (const [question,,proof] of contextual) {
        if (!proof.returnedFacts) continue;
        for (const candidate of [
            {...proof,returnedFacts:undefined},
            {...proof,returnedFacts:[]},
            {...proof,returnedFacts:proof.returnedFacts.map(value => replace(value,value.text.slice(0,-1)))},
            {...proof,returnedFacts:proof.returnedFacts.map(value => ({...value,witness:'partial excerpt'}))},
            {...proof,returnedFacts:proof.returnedFacts.map(value => ({...value,source:undefined}))}
        ]) assert.equal(check(question,candidate),false,question);
    }
    for (const [question,suffix,wrong] of [
        ['Can those defaults be changed?','bwapi-visibility','bwapi-identity'],
        ['Which mode should I use instead?','map-game-type','map-folder'],
        ['What plans its build orders?','ualberta-components','ualberta-version']
    ]) {
        assert.equal(check(question,followup(suffix,wrong)),false,question);
        assert.equal(check(question,{...followup(suffix),grounded:false}),false,question);
    }
    // The caller can supply a completely displayed related-source quote even
    // when the preceding overall answer declined a deeper causal explanation.
    assert.equal(check('Which mode should I use instead?',followup('map-game-type')),true);
});

test('Whole reviewed software fields ground later owner references without granting a new capability',async()=>{
    const {buildKnowledge}=await import('../../js/assistant/knowledge.js');
    const records=JSON.parse(await readFile(new URL('./evidence/conversation-starcraft-source-records.json',import.meta.url),'utf8'));
    const knowledge=buildKnowledge('starcraft',records,manifest);assert.deepEqual(knowledge.issues,[]);
    const question='Which Java runtime does it require?';
    for(const prior of ['purplewave-build','purplewave-working-folder','purplewave-support']){
        const compiled=knowledge.facts.find(value=>value.id===`starcraft:knowledge:${prior}`);
        const proof=followup('purplewave-java',prior,{returnedFacts:[compiled]});
        assert.equal(check(question,proof),true,prior);
        const original=proof.returnedFacts[0];
        for(const previous of [
            fact(prior),
            {...original,recordId:null},
            {...original,record:{...original.record,source:{...original.record.source,locator:'unrelated-source'}}},
            {...original,researchWitness:{...original.researchWitness,checkedAt:null}},
            {...original,source:{...original.source,references:[]}},
            {...original,source:undefined},
            {...original,conflict:true},
            {...original,entityId:'unrelated-software'},
            {...original,sourceFields:[{key:'unknown',selectors:[],witness:original.witness}]},
            {...original,sourceFields:[{key:'method',selectors:[],witness:original.witness.slice(0,-1)}]},
            {...original,sourceFields:[{key:'method',selectors:[],witness:original.witness,
                source:{...original.source,locator:'unrelated-source'}}]},
            replace(original,original.text.slice(0,-1))
        ])assert.equal(check(question,{...proof,returnedFacts:[previous]}),false,prior);
        assert.equal(check(question,{...proof,facts:[fact(prior)]}),false,'A returned build/directory/support field is not a Java requirement');
        assert.equal(supports({...parse(question),fieldText:'composition'},proof),false,'Unknown requested fields remain unsupported');
    }
    const local=followup('schnail-java','schnail-game-files');
    assert.equal(check(question,local),true,'A complete local setup witness grounds its actual client');
    assert.equal(check(question,{...local,returnedFacts:local.returnedFacts.map(value=>({...value,sourceRecordId:null}))}),false);
});

test('Omitted Java comparator and instead retain tool, guide-source, runtime version and architecture', () => {
    const same = 'Does PurpleWave use the same Java runtime?', sameProof = reference('purplewave-java','schnail-java');
    assert.equal(check('Does PurpleWave use the same Java runtime as SCHNAIL?',sameProof),true);
    for (const candidate of [
        {...sameProof,referenceEntityId:undefined},
        {...sameProof,referenceEntityId:sameProof.subjectEntityId},
        {...sameProof,referenceLabels:['Steamhammer']},
        {...sameProof,returnedFacts:[fact('schnail-network')]},
        {...sameProof,returnedFacts:[fact('purplewave-java')]},
        {...sameProof,facts:[replace(fact('purplewave-java'),fact('purplewave-java').text.replace('32-bit JDK 8','JDK 21'))]},
        {...sameProof,facts:[replace(fact('purplewave-java'),fact('purplewave-java').text.replace('32-bit BWAPI','BWAPI'))]},
        {...sameProof,facts:[replace(fact('purplewave-java'),fact('purplewave-java').text.split('. Do not substitute')[0]+'.')]}
    ]) assert.equal(check(same,candidate),false);
    assert.equal(check('What does the guide recommend for SCHNAIL instead?',reference('schnail-updates','purplewave-java')),false);
    const guide = reference('schnail-java','purplewave-java');
    assert.equal(check('What does the guide recommend for SCHNAIL instead?',{...guide,facts:[{...fact('schnail-java'),source:{...fact('schnail-java').source,review:'external-research'}}]}),false);
});

test('Static default changes preserve normal visibility, tournament enforcement and anti-guarantee caveat', () => {
    const question='Does BWAPI let bots see units outside visible state by default?', proof=context('bwapi-visibility');
    for (const text of [
        'BWAPI hides units outside visible game state.',
        fact('bwapi-visibility').text.replace('normally ',''),
        fact('bwapi-visibility').text.replace('; tournament modules can enforce settings',''),
        fact('bwapi-visibility').text.replace('Changed defaults are announced, so this is not a guarantee that every bot uses identical restrictions.','Every bot uses identical restrictions.')
    ]) assert.equal(check(question,{...proof,facts:[replace(fact('bwapi-visibility'),text)]}),false);
    assert.equal(check('Can those defaults be changed?',followup('bwapi-visibility','bwapi-identity')),false);
});

test('Installation conflict is a bounded full-source answer rather than a general conflict bypass', () => {
    const question='What about the BWAILauncher game installation?',proof=context('bwai-conflict');
    assert.equal(check(question,context('bwai-install')),false);
    for (const candidate of [
        {...proof,facts:[{...fact('bwai-identity'),conflict:true}]},
        {...proof,facts:[{...fact('bwai-conflict'),source:{...fact('bwai-conflict').source,review:'extracted'}}]},
        {...proof,facts:[replace(fact('bwai-conflict'),fact('bwai-conflict').text.split('. These sources')[0]+'.')]},
        {...proof,facts:[replace(fact('bwai-conflict'),fact('bwai-conflict').text.replace('cannot confirm','can confirm'))]}
    ]) assert.equal(check(question,candidate),false);
});

test('Map method capability differs from menu navigation, developer target and arbitrary-map certification', () => {
    assert.equal(check('Which map method works directly with Remastered?',context('map-menu')),false);
    assert.equal(check('Can the map method use arbitrary maps?',context('map-identity')),false);
    assert.equal(check('Does BWAPI’s own developer quick start target Remastered?',context('map-launcher')),false);
    assert.equal(check('Does BWAPI’s own developer quick start target Remastered?',context('bwapi-identity')),false);
    const proof=context('map-launcher');
    for (const text of [fact('map-launcher').text.replace('; Limited to the provided integrated maps',''),fact('map-launcher').text.replace('Must be played in "Use Map Settings" mode','Can be played in Melee mode')])
        assert.equal(check('Which map method works directly with Remastered?',{...proof,facts:[replace(fact('map-launcher'),text)]}),false);
});

test('Unknown conditions, editions, sources, quantities and compound requests cannot disappear', () => {
    for (const [question,,proof] of cases) {
        for (const suffix of [' in copper edition',' on Mars',' after two games',' assuming installation succeeded',' and delete my saves']) {
            assert.equal(check(question.replace(/\?$/,suffix+'?'),proof),false,question+suffix);
        }
    }
    for (const [question,proof] of [
        ['What is BWAILauncher in Remastered used for?',context('bwai-identity')],
        ['Does PurpleWave use the same Java runtime as Steamhammer?',reference('purplewave-java','schnail-java')],
        ['Which map method works directly with copper Remastered?',context('map-launcher')],
        ['Why is the advanced copper AI wrong in a standard Melee game?',context('map-game-type')],
        ['Can the copper map method use arbitrary maps?',context('map-launcher')],
        ['Where do I put the matching copper JSON configuration?',followup('steamhammer-config','steamhammer-download')],
        ['Where does Steamhammer’s binary configuration in Remastered go?',context('steamhammer-config')],
        ['What plans two of its build orders?',followup('ualberta-components')]
    ]) assert.equal(check(question,proof),false,question);
});

test('The actual offline-comparison dialogue first returns the complete antecedent before reading its contrast', async () => {
    const [{buildKnowledge},{createAssistant},{createConversationAssistant}] = await Promise.all([
        import('../../js/assistant/knowledge.js'),import('../../js/assistant/engine.js'),import('../../js/assistant/dialogue.js')
    ]);
    const records=JSON.parse(await readFile(new URL('./evidence/conversation-starcraft-source-records.json',import.meta.url),'utf8'));
    const report=JSON.parse(await readFile(new URL('./evidence/knowledge-browser-full-corpus-sequence-scope-20261025-03.json',import.meta.url),'utf8'));
    const knowledge=buildKnowledge('starcraft',records,manifest),source=createAssistant({gameId:'starcraft',records,fallback:null});
    const assistant=createConversationAssistant({gameId:'starcraft',records,knowledge,assistant:source,classify:async()=>[],encode:async()=>{throw Error('Encoder unavailable');}});
    try {
        const rows=report.turns.filter(row=>row.surface==='starcraft' && row.dialogueId==='starcraft-knowledge-offline-comparison' && row.turn<=2);
        assert.equal(rows.length,2);
        for (const [index,row] of rows.entries()) {
            const reply=await assistant.answerAsync(row.text), expected=fact(index===0?'bwai-offline':'schnail-network');
            assert.equal(reply.decision,'answer',row.text);
            assert.ok(reply.text.includes(expected.witness),row.text);
            assert.deepEqual(reply.actions,[]);assert.deepEqual(reply.stateChanges,[]);
        }
        assert.equal(source.inspect().claimCount,0);
    } finally { assistant.destroy(); }
});

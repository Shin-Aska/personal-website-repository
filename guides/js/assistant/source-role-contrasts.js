// Return complete source identity or role evidence with an explicit uncertainty
// qualification; a source passage is never treated as proof of its inverse.
import {sameAuthorizedSource} from './procedure-phase-fields.js';
const norm=value=>typeof value==='string'?value.normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim():'';
const bare=value=>norm(value).replace(/^(?:the|a|an) /,'');
const escaped=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

export function contradictoryIdentity(text,{facts=[],entities,sourceRecords=[],isEligible}={}){
 const q=/^is (.+?) (?:a|an) ([\p{L} ]+)\?$/u.exec(norm(text));
 if(!q || !entities?.get || typeof isEligible!=='function')return null;
 const descriptors=q[2].split(' ');
 if(!descriptors.includes('human') || descriptors.some(word=>['in','on','with','without','after','before','if','unless',
  'and','or','for','from','according','during','under','except','no','not','never','only','all','every','exactly',
  'edition','version'].includes(word)))return null;
 const matches=[];
 for(const fact of facts){
  const owner=entities.get(fact.entityId),source=sourceRecords.find(record=>record.id===fact.sourceRecordId);
  if(!owner || ![owner.name,...(owner.aliases || [])].map(bare).includes(bare(q[1]))
   || !fact.answerRelations?.includes('identity') || !isEligible(fact) || !sameAuthorizedSource(fact,source))continue;
  const witness=norm(fact.text);
  if(!new RegExp(`^${escaped(q[1])}: (?:the |a |an )?(?:bound )?daemon\\b`,'u').test(witness))continue;
  matches.push(fact);
 }
 return matches.length===1?matches[0]:null;
}

export function accusedVictimContrast(text,{facts=[],sourceRecords=[],isEligible}={}){
 const q=/^does ([\p{L}'-]+) being the accuser make ([\p{L}'-]+) the thief\?$/u.exec(norm(text));
 if(!q || typeof isEligible!=='function' || q[1]===q[2])return null;
 const matches=[];
 for(const fact of facts){
  const source=sourceRecords.find(record=>record.id===fact.sourceRecordId);
  if(!isEligible(fact) || !sameAuthorizedSource(fact,source)
   || norm(source.title)!==`${q[1]}'s accusations`)continue;
  const pattern=new RegExp(`\\baccused [\\p{L}]+, ${escaped(q[2])}\\. (?:he|she|they) (?:was|were) the victim\\b`,'u');
  if(!pattern.test(norm(fact.text)) || !/\bstolen\b/.test(norm(fact.text)))continue;
  matches.push(fact);
 }
 matches.sort((a,b)=>a.text.length-b.text.length);
 const first=matches[0];
 return first && matches.every(fact=>fact.source.file===first.source.file && fact.source.locator===first.source.locator
  && fact.text.includes(first.text))?first:null;
}

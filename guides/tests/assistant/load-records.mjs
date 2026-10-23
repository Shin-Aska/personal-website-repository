// Node-only fixture loader. It evaluates existing trusted guide declarations,
// never visitor input, and never ships as part of the browser assistant.
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { buildAlbionRecords } from '../../js/assistant/adapters/albion.js';
import { buildUltima6Records } from '../../js/assistant/adapters/ultima6.js';
import { buildUltima5Records } from '../../js/assistant/adapters/ultima5.js';
import { buildUltima7Records } from '../../js/assistant/adapters/ultima7.js';
import { buildAlQadimRecords } from '../../js/assistant/adapters/alqadim.js';
const root = fileURLToPath(new URL('../../', import.meta.url));
const read = file => fs.readFileSync(root + file, 'utf8');
const json = game => JSON.parse(read(`data/assistant/${game}.json`));
function declarations(file, end, names) {
  const context = vm.createContext({window:{}});
  vm.runInContext(read(file).split(end)[0] + `\nthis.fixture = {${names}};`, context, {timeout: 2000});
  return context.fixture;
}
function atlas(file, name) { const context=vm.createContext({window:{}});vm.runInContext(read(file),context,{timeout:2000});return context.window[name]; }
export const albion = declarations('js/Albion.js', 'const QUEST_STORAGE_KEY', 'DB,QUEST_LOG,QUEST_HINTS,ALBION_TRADE_HINTS,ALBION_CAMPAIGN_MOVEMENTS');
export const u6 = declarations('js/Ultima6.js', 'const seerState', 'gameData');
export const u5 = declarations('js/Ultima5.js', '// Initialize the application', 'ultima5GrandQuestChapters,ultima5SideQuests,companionData,spellData,commonTips,wordData,moongatePhaseData');
export const u7 = declarations('js/Ultima7.js', 'const QUEST_LINKS', 'DB');
export const aq = declarations('js/AlQadim.js', 'const CHAPTER_ATLAS_ROUTES', 'DB');
export const u7Markers = atlas('js/Ultima7Markers.js','ULTIMA7_MARKERS');
export const allRecords = {
 albion: buildAlbionRecords({DB:albion.DB,questLog:albion.QUEST_LOG,questHints:albion.QUEST_HINTS,tradeHints:albion.ALBION_TRADE_HINTS,movements:albion.ALBION_CAMPAIGN_MOVEMENTS,atlas:atlas('js/AlbionAtlasData.js','ALBION_ATLAS_CONFIG'),overlay:json('albion')}),
 ultima6:buildUltima6Records({gameData:u6.gameData,atlas:atlas('js/Ultima6Atlas.js','BRITANNIA_MAP_CONFIG'),overlay:json('ultima6')}).records,
 ultima5:buildUltima5Records({chapters:u5.ultima5GrandQuestChapters,sideQuests:u5.ultima5SideQuests,companions:u5.companionData,spells:u5.spellData,tips:u5.commonTips,words:u5.wordData,moongates:u5.moongatePhaseData,atlas:atlas('js/Ultima5AtlasData.js','ULTIMA5_ATLAS_CONFIG'),overlay:json('ultima5')}),
 ultima7:buildUltima7Records(u7.DB,json('ultima7'),{},atlas('js/Ultima7Markers.js','ULTIMA7_MARKERS')),
 alqadim:buildAlQadimRecords(aq.DB,json('alqadim'),{},atlas('js/AlQadimAtlasData.js','ALQADIM_ATLAS_DATA'))
};

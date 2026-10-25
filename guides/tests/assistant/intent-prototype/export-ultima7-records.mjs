// Reuse the trusted Node-only guide declaration loader; no visitor code executes.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {allRecords} from '../load-records.mjs';

const guides = new URL('../../../', import.meta.url);
const sources = ['js/Ultima7.js','js/Ultima7Markers.js','js/assistant/adapters/ultima7.js',
    'js/assistant/narrative.js','data/assistant/ultima7.json'];
const hashes = {};
for (const name of sources) {
    const file = new URL(name,guides);
    if (fs.existsSync(file)) hashes[name] = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
const output = new URL('./assets/ultima7-records.json',import.meta.url);
fs.mkdirSync(new URL('./assets/',import.meta.url),{recursive:true});
fs.writeFileSync(output,JSON.stringify({schema:1,gameId:'ultima7',sourceHashes:hashes,records:allRecords.ultima7},null,2)+'\n');
console.log(`Exported ${allRecords.ultima7.length} current Ultima VII records for the isolated lab.`);

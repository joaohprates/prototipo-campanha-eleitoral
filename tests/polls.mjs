import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const context={window:{}};
runInNewContext(readFileSync('js/polls-data.js','utf8'),context);
const D=context.window.SIE_POLLS;
assert.equal(D.polls.length,5);
assert.equal(new Set(D.polls.map(p=>p.id)).size,D.polls.length);
assert.equal(D.select({office:'presidente'}).length,3);
assert.equal(D.select({office:'senador',round:'2'}).length,0);
assert.equal(D.select({office:'senador',uf:'MG'}).length,1);
assert.equal(D.select({office:'deputado_federal'}).length,0);
assert.equal(D.select({institute:'Datafolha',uf:'BR'}).length,1);
assert.equal(D.select({institute:'Real Time Big Data',uf:'BR'}).length,0);
assert.equal(D.select({search:'marilia'}).length,1);
assert.equal(D.select({search:'  BR-01833/2026  '}).length,1);
assert.equal(D.select({})[0].published,'2026-09-14');
assert.equal(D.select({sort:'oldest'})[0].published,'2026-09-10');
for(const p of D.polls){
 assert.ok(p.start<=p.end && p.end<=p.published && p.published<=D.reviewed);
 assert.ok(p.source.startsWith('https://'));
 assert.ok(p.sample>0 && p.margin>0);
 assert.ok(D.institutes.includes(p.institute) && D.offices[p.office]);
 for(const s of p.scenarios){
  assert.ok(s.note && s.results.length);
  for(const r of s.results)assert.ok(r.name && Number.isFinite(r.value) && r.value>=0 && r.value<=100);
 }
}
assert.equal(D.select({institute:'AtlasIntel'})[0].scenarios.length,0);
console.log('PASS: catálogo, fontes, datas, resultados, combinações de filtros, acentos, ordenação e estados sem pesquisa.');

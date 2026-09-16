import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { Script, runInNewContext } from 'node:vm';
for (const dir of ['js', 'js/views']) {
  for (const file of readdirSync(dir).filter(f => f.endsWith('.js'))) {
    new Script(readFileSync(`${dir}/${file}`, 'utf8'), { filename: `${dir}/${file}` });
  }
}
let view, blob, downloaded = false;
const elements = new Map();
function element(selector) {
  if (!elements.has(selector)) elements.set(selector, { value:'all', textContent:'', innerHTML:'', events:{}, addEventListener(event,fn){this.events[event]=fn;} });
  return elements.get(selector);
}
runInNewContext(readFileSync('js/views/fontes.js','utf8'), {
  SIE:{registerView(id,def){ assert.equal(id,'fontes'); view=def; }},
  Blob,
  URL:{createObjectURL(value){blob=value;return 'blob:test';},revokeObjectURL(){}},
  document:{body:{appendChild(){}},createElement(){return {click(){downloaded=true;},remove(){}};}},
  setTimeout(fn){fn();}, window:{print(){}}
});
view.render({set innerHTML(value){},querySelector:element});
assert.equal(element('#source-count').textContent,'4 de 4 fontes');
for (const [kind,count] of [['oficial',2],['demo',1],['pending',1],['all',4]]) {
  element('#source-kind').value=kind;
  element('#source-kind').events.change();
  assert.equal(element('#source-count').textContent,`${count} de 4 fontes`);
  element('#export-sources').events.click();
  assert.ok(downloaded);
  assert.equal(blob.type,'text/csv;charset=utf-8');
  const bytes=new Uint8Array(await blob.arrayBuffer());
  assert.deepEqual(Array.from(bytes.slice(0,3)),[239,187,191]);
  const text=await blob.text();
  assert.equal(text.split('\r\n').length,count+1);
  assert.ok(text.startsWith('"Fonte";"Status";'));
  if(kind==='oficial') {assert.ok(text.includes('https://www.tse.jus.br/'));assert.ok(!text.includes('BASE DEMONSTRATIVA'));}
}
console.log('PASS: sintaxe de todos os módulos; quatro filtros e exportações CSV com BOM UTF-8, cabeçalho e contagem corretos.');

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const context = { window: {}, echarts: { registerTheme() {}, registerMap() {} } };
runInNewContext(readFileSync('js/data.js', 'utf8'), context);
// Access the internal selector transformation without changing the production API.
runInNewContext(readFileSync('js/app.js', 'utf8').replace('boot: boot', 'boot: boot, selectScenario: applyTerritoryData, territories: territories'), context);
const app = context.window.SIE;
const sum = values => values.reduce((a, b) => a + b, 0);
const close = (a, b) => assert.ok(Math.abs(a - b) < 0.00001, `${a} != ${b}`);
const snapshots = new Map();
for (const territory of app.territories) {
  app.selectScenario(territory);
  const d = app.DATA;
  close(sum(d.candidatos.map(c => c.proj)), 100);
  close(sum(d.candidatos.map(c => c.delta)), 0);
  close(sum(d.plataformas.map(p => p.share)), 100);
  for (const p of d.perfis) close(sum(Object.values(p.espectro)), 100);
  for (const c of d.candidatos.slice(0, 3)) {
    const series = d.projSeries[c.id];
    close(series.at(-1), c.proj);
    close(series.at(-1) - series.at(-8), c.delta);
    assert.ok(series.every(v => v >= 0 && v <= 100));
  }
  for (const [id, series] of Object.entries(d.pautasSeries)) {
    close(series.at(-1), d.pautas.find(p => p.id === id).tracao);
    assert.ok(series.every(v => v >= 0 && v <= 100));
  }
  assert.ok(d.kpis.municipiosAtivos <= d.kpis.municipios);
  assert.equal(d.kpis.ondasEmergentes, d.ondas.filter(o => o.fase < 3).length);
  assert.ok(d.feed[0].txt.includes(`${d.ondas[0].cresc}%`));
  assert.ok(d.ticker[2].includes(app.fmt.compact(d.kpis.sinais24h)));
  assert.ok(d.ticker[6].includes(app.fmt.pct(d.kpis.precisaoModelo, 1)));
  snapshots.set(territory.code, JSON.stringify(d));
}
for (const territory of [...app.territories].reverse()) {
  app.selectScenario(territory);
  assert.equal(JSON.stringify(app.DATA), snapshots.get(territory.code), `Repeated selection drift: ${territory.code}`);
}
app.selectScenario({ name: 'Paraná', code: 'PR' });
assert.equal(app.DATA.kpis.sinais24h, 9100000);
assert.equal(app.DATA.kpis.sinaisDelta, 8.2);
assert.equal(app.territories.length, 28);
console.log('PASS: 28 territórios; totais de 100%, deltas, gráficos/cards, feed/ticker, cobertura e troca de território sem acúmulo.');

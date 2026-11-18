// Gera PDF A4 e PNG 300 dpi a partir de um HTML. Uso: node render_a4.js entrada.html saida(sem extensão)
const { chromium } = require('playwright');
(async () => {
  const [src, out] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 3.125 });
  await p.goto('file://' + src, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: out + '.png' });
  await p.pdf({ path: out + '.pdf', format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await b.close();
})();

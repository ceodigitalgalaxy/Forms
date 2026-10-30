// Renderiza páginas HTML em PNG 1080x1350. Uso: node render.js entrada.html|saida.png ...
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const job of process.argv.slice(2)) {
    const [src, out] = job.split('|');
    await page.goto('file://' + src, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: out });
    console.log(out);
  }
  await browser.close();
})();

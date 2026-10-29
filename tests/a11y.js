// Verificação automática de acessibilidade (axe-core) e de rolagem horizontal em 4 larguras.
// Uso: npm run build && npm run a11y   (usa o Chromium do Playwright)
const fs = require("node:fs");
const path = require("node:path");
const { criarApp } = require("../api/server");

const LARGURAS = [360, 768, 1024, 1440];
const axeSrc = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

function paginas(dir) {
  const lista = [];
  (function varrer(d) {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) { if (!["assets", "arquivos", "admin", "dados"].includes(f.name)) varrer(p); }
      else if (f.name === "index.html") lista.push("/" + path.relative(dir, d).replace(/\\/g, "/") + (d === dir ? "" : "/"));
    }
  })(dir);
  return lista.sort();
}

(async () => {
  const { chromium } = require("playwright");
  const site = path.join(__dirname, "..", "_site");
  const app = criarApp({ dbPath: ":memory:", siteDir: site, uploadDir: "/tmp/smma-a11y", outboxLog: "/tmp/smma-a11y.log" });
  const srv = await new Promise((r) => { const s = app.listen(0, () => r(s)); });
  const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  let falhas = 0;
  const urls = paginas(site);
  console.log(`${urls.length} páginas × ${LARGURAS.length} larguras`);
  for (const modo of ["normal", "alto-contraste"]) {
    for (const url of urls) {
      for (const w of LARGURAS) {
        if (modo === "alto-contraste" && w !== 1024) continue;
        const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
        const page = await ctx.newPage();
        // evita chamadas externas (VLibras, mapas) durante o teste
        await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
        await page.addInitScript((m) => { try { localStorage.setItem("smma-a11y", JSON.stringify({ contraste: m === "alto-contraste" })); localStorage.setItem("smma-cookies-ok", "1"); } catch (e) {} }, modo);
        await page.goto(base + url, { waitUntil: "load" });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 1) { falhas++; console.log(`✗ [${w}px] ${url}: rolagem horizontal (${overflow}px)`); }
        if (modo === "alto-contraste" || w === 1024 || w === 360) {
          await page.addScriptTag({ content: axeSrc });
          const r = await page.evaluate(() => axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] }, rules: { "color-contrast": { enabled: true } } }));
          for (const v of r.violations) {
            // regiões flutuantes do VLibras não existem offline
            falhas++; console.log(`✗ [${modo} ${w}px] ${url}: ${v.id} (${v.impact}) — ${v.help}\n    ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
          }
        }
        await ctx.close();
      }
    }
  }
  await browser.close(); srv.close();
  console.log(falhas ? `\n${falhas} problema(s) encontrado(s).` : "\nNenhum problema encontrado.");
  process.exit(falhas ? 1 : 0);
})();

// Configuração do Eleventy — site da Secretaria Municipal de Meio Ambiente de Frutal
const MARCADOR = "[●]";
const MARCADOR_HTML =
  '<span class="placeholder" title="Informação oficial a ser preenchida antes da publicação">[●]</span>';

// Troca [●] por um marcador visível, apenas no texto (nunca em atributos, scripts ou <title>).
function marcarPendencias(html) {
  if (!html.includes(MARCADOR)) return html;
  let ignorar = null;
  return html
    .split(/(<[^>]*>)/)
    .map((parte) => {
      if (parte.startsWith("<")) {
        const abre = parte.match(/^<(script|style|title|textarea)\b/i);
        const fecha = parte.match(/^<\/(script|style|title|textarea)\b/i);
        if (abre) ignorar = abre[1].toLowerCase();
        if (fecha) ignorar = null;
        return parte;
      }
      return ignorar ? parte : parte.split(MARCADOR).join(MARCADOR_HTML);
    })
    .join("");
}

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const iso = (d) => new Date(d).toISOString().slice(0, 10);

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/img");
  eleventyConfig.addPassthroughCopy("src/arquivos");
  eleventyConfig.addPassthroughCopy("src/admin/config.yml");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy({
    "node_modules/leaflet/dist": "assets/vendor/leaflet",
    "node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2": "assets/fonts/source-sans-3-latin.woff2",
    "node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-ext-wght-normal.woff2": "assets/fonts/source-sans-3-latin-ext.woff2",
  });

  eleventyConfig.addTransform("pendencias", function (content) {
    return (this.page.outputPath || "").endsWith(".html") ? marcarPendencias(content) : content;
  });

  // ---- filtros ----
  eleventyConfig.addFilter("dataBR", (d) => {
    const x = new Date(d);
    return `${String(x.getUTCDate()).padStart(2, "0")}/${String(x.getUTCMonth() + 1).padStart(2, "0")}/${x.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("dataLonga", (d) => {
    const x = new Date(d);
    return `${x.getUTCDate()} de ${MESES[x.getUTCMonth()]} de ${x.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("dataISO", iso);
  eleventyConfig.addFilter("diaMes", (d) => String(new Date(d).getUTCDate()).padStart(2, "0"));
  eleventyConfig.addFilter("mesCurto", (d) => MESES[new Date(d).getUTCMonth()].slice(0, 3));
  eleventyConfig.addFilter("ano", (d) => new Date(d).getUTCFullYear());
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("tipoLabel", (t) => ({ campanha: "Campanha", evento: "Evento", data: "Data comemorativa", prazo: "Prazo de serviço" }[t] || t));
  eleventyConfig.addFilter("aPartirDe", (arr, d) => (arr || []).filter((e) => (e.dataFim || e.data) >= iso(d)));
  eleventyConfig.addFilter("catLabel", (c) => ({ noticia: "Notícia", comunicado: "Comunicado oficial", aviso: "Aviso de atendimento", edital: "Edital" }[c] || c));
  eleventyConfig.addFilter("statusLabel", (s) => ({ andamento: "Em andamento", concluido: "Concluído", planejado: "Planejado" }[s] || s));
  eleventyConfig.addFilter("unicos", (arr, chave) => [...new Set((arr || []).map((x) => x[chave]))]);
  eleventyConfig.addFilter("absoluta", (url, base) => new URL(url, base).href);

  // ---- coleções ----
  const porData = (a, b) => b.date - a.date;
  eleventyConfig.addCollection("noticias", (c) => c.getFilteredByGlob("src/noticias/*.md").sort(porData));
  eleventyConfig.addCollection("servicos", (c) => c.getFilteredByGlob("src/servicos/*.md").sort((a, b) => (a.data.ordem || 99) - (b.data.ordem || 99)));
  eleventyConfig.addCollection("projetos", (c) => c.getFilteredByGlob("src/projetos/*.md").sort((a, b) => (a.data.ordem || 99) - (b.data.ordem || 99)));
  eleventyConfig.addCollection("documentos", (c) => c.getFilteredByGlob("src/documentos/*.md").sort(porData));

  // Eventos = arquivos em src/eventos + datas ambientais recorrentes (ano atual e seguinte).
  eleventyConfig.addCollection("eventosTodos", (c) => {
    const global = c.getAll()[0].data;
    const hoje = new Date();
    const anos = [hoje.getUTCFullYear(), hoje.getUTCFullYear() + 1];
    const lista = [];
    for (const it of c.getFilteredByGlob("src/eventos/*.md")) {
      lista.push({
        titulo: it.data.title, data: iso(it.date), dataFim: it.data.dataFim ? iso(it.data.dataFim) : null,
        tipo: it.data.tipo || "evento", local: it.data.local || "", hora: it.data.hora || "",
        descricao: it.data.descricao || "", destaque: it.data.destaque || null,
      });
    }
    for (const d of global.datasAmbientais || []) {
      for (const ano of anos) {
        lista.push({
          titulo: d.titulo, data: `${ano}-${String(d.mes).padStart(2, "0")}-${String(d.dia).padStart(2, "0")}`,
          dataFim: null, tipo: "data", local: "Todo o município", hora: "", descricao: d.descricao, destaque: null,
        });
      }
    }
    return lista.sort((a, b) => a.data.localeCompare(b.data));
  });

  eleventyConfig.addCollection("paraSitemap", (c) =>
    c.getAll().filter((p) => p.url && typeof p.url === "string" && p.url.endsWith("/") && !p.data.noindex && p.url !== "/404.html")
  );
  eleventyConfig.addGlobalData("buildDate", () => new Date().toISOString());

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};

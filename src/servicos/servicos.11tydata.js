const link = (d) => (d.acao !== undefined ? d.acao : d.semFormulario ? null : `/servicos/${d.page.fileSlug}/solicitar/`);

module.exports = {
  layout: "layouts/servico.njk",
  crumbs: [{ t: "Serviços", u: "/servicos/" }],
  eleventyComputed: {
    description: (d) => d.resumo,
    acaoUrl: link,
    ctaFixo: (d) => (link(d) ? { texto: d.acaoTexto || "Iniciar solicitação", url: link(d) } : null),
  },
};

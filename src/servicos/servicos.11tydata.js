module.exports = {
  layout: "layouts/servico.njk",
  crumbs: [{ t: "Serviços", u: "/servicos/" }],
  eleventyComputed: {
    description: (d) => d.resumo,
    acaoUrl: (d) => (d.acaoUrl !== undefined ? d.acaoUrl : d.semFormulario ? null : `/servicos/${d.page.fileSlug}/solicitar/`),
    ctaFixo: (d) => {
      const url = d.acaoUrl !== undefined ? d.acaoUrl : d.semFormulario ? null : `/servicos/${d.page.fileSlug}/solicitar/`;
      return url ? { texto: d.acaoTexto || "Iniciar solicitação", url } : null;
    },
  },
};

module.exports = {
  eleventyComputed: {
    title: (d) => d.f.titulo,
    description: (d) => `Formulário online: ${d.f.titulo}. Você recebe um número de protocolo para acompanhar.`,
    crumbs: (d) => [
      { t: "Serviços", u: "/servicos/" },
      { t: d.f.servico, u: `/servicos/${d.f.slug}/` },
    ],
    scripts: (d) => ["/assets/js/forms.js"].concat(d.f.tipo === "denuncia" ? ["/assets/js/mapa.js"] : []).concat(d.f.tipo === "agendamento" ? ["/assets/js/agendamento.js"] : []),
    noindex: () => false,
  },
};

module.exports = {
  layout: "layouts/projeto.njk",
  crumbs: [{ t: "Projetos e Ações", u: "/projetos/" }],
  eleventyComputed: { description: (d) => d.resumo },
};

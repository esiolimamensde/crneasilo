module.exports = {
  layout: "layouts/noticia.njk",
  crumbs: [{ t: "Notícias", u: "/noticias/" }],
  eleventyComputed: {
    description: (d) => d.resumo,
    ogImage: (d) => d.imagem,
  },
};

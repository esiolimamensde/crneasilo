module.exports = { permalink: false, eleventyComputed: { ano: (d) => new Date(d.page.date).getUTCFullYear() } };

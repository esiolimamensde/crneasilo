# Checklist de testes em dispositivos móveis

Larguras de referência: **360, 768, 1024 e 1440 px** (automatizadas em `npm run a11y`: sem rolagem horizontal).

## Dispositivos reais sugeridos
Android econômico (Chrome, 360×800), iPhone (Safari), tablet (768 px), notebook (1366/1440 px).

## Verificar em cada um
- [ ] Menu hambúrguer: botões grandes (≥ 48 px), abre/fecha, busca sempre visível no topo
- [ ] Botão fixo "Iniciar solicitação" nas páginas de serviço; não cobre conteúdo nem o aviso de cookies
- [ ] Botões e links ≥ 44 × 44 px, com espaço entre eles
- [ ] Formulários: teclado certo (e-mail, telefone, data), rótulos visíveis, erros legíveis
- [ ] Upload de fotos funciona (câmera/galeria), com limite de 5 arquivos × 5 MB
- [ ] Mapa da denúncia: opcional; endereço em texto sempre funciona
- [ ] Tabelas de documentos viram cards; calendário mensal legível (pontos) e lista como alternativa
- [ ] Orientação retrato e paisagem
- [ ] Zoom do sistema / fonte grande do Android (200 %)
- [ ] Modo escuro do sistema não quebra (site usa tema claro próprio; alto contraste disponível)
- [ ] Conexão 4G lenta / "Lite": páginas utilizáveis sem JS para ler conteúdo (filtros dependem de JS)

## Desempenho (meta: LCP < 2,5 s em 4G)
- [ ] Lighthouse mobile (4G simulada): LCP, CLS < 0,1, TBT baixo
- [ ] Imagens em WebP/AVIF, `loading="lazy"`, dimensões definidas; hero com `fetchpriority="high"`
- [ ] Fonte local com `preload`; CSS sem framework (~25 KB); JS por página (sem bibliotecas), VLibras só após `load`
- [ ] Leaflet e tiles só carregam quando o cidadão clica em "Abrir mapa"

## Medição de referência (ambiente de desenvolvimento)
4G simulada (1,6 Mbps, 150 ms), CPU 4× mais lenta, 360 px, com as ilustrações SVG provisórias: **LCP ≈ 0,9–1,0 s, CLS 0**. Repita a medição depois de trocar o hero por foto real — a foto deve ser WebP/AVIF, ≤ 150 KB e com `fetchpriority="high"`.

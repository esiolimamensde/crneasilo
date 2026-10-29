# Hospedagem, backup e LGPD

## Hospedagem
- **Site:** pasta `_site/` (estática) — qualquer hospedagem; **HTTPS obrigatório** (Let's Encrypt).
- **API:** Node.js ≥ 22.13 (`node api/server.js`), atrás de proxy reverso (nginx/Caddy) com `TRUST_PROXY=1`. Se site e API ficarem em domínios diferentes, defina `CORS_ORIGIN` e `apiBase` no layout.
- **Build:** a cada publicação no Git e uma vez por dia (eventos futuros).
- Cabeçalhos recomendados no proxy: `Strict-Transport-Security`, `Content-Security-Policy` (permitir `vlibras.gov.br` e `tile.openstreetmap.org`), `X-Content-Type-Options`, `Referrer-Policy` (a API já envia os três últimos).

## Backups
| O quê | Frequência | Retenção |
|---|---|---|
| `api/data/smma.sqlite` (use `sqlite3 .backup`) | diária | 30 dias + mensal por 12 meses [●] |
| `api/uploads/` | diária | igual ao banco |
| Repositório Git (conteúdo do site) | a cada alteração | histórico do Git + espelho externo |
Teste a restauração a cada trimestre.

## Plano de atualização
Mensal: `npm audit`, atualizar dependências e Node LTS, rodar `npm test` e `npm run a11y`. Revisar este plano com a TI da Prefeitura.

## LGPD
- **Finalidade e minimização:** cada formulário pede só o necessário; denúncia anônima não guarda nome, e-mail, telefone nem IP (limite de envios é só em memória).
- **Consentimento:** caixa obrigatória e não pré-marcada nos formulários identificados e na newsletter.
- **Cookies:** apenas armazenamento essencial (preferências de acessibilidade); sem rastreadores.
- **Estatísticas:** se necessárias, use ferramenta sem cookies e com IP anonimizado (ex.: Matomo anonimizado ou Plausible) e informe na Política de privacidade [●]. Não instalada por padrão.
- **Terceiros:** VLibras (gov.br) e OpenStreetMap (apenas ao abrir o mapa) podem receber o IP do visitante — citado na Política de privacidade.
- **Retenção e descarte:** definir prazos [●]; apagar anexos vencidos de `api/uploads/`.
- **Direitos do titular:** canal no Contato; encarregado (DPO) [●].
- **Fotos enviadas:** podem conter localização (EXIF). Recomenda-se remover metadados ao arquivar [●].

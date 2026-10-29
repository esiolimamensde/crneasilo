# Site da Secretaria Municipal de Meio Ambiente de Frutal (MG)

Portal institucional acessível (WCAG 2.1 AA / eMAG), com serviços online, denúncias (inclusive anônimas), calendário ambiental, notícias e transparência.

**Stack:** Eleventy (HTML estático) · CSS/JS puros no navegador · Decap CMS (painel de publicação) · API Node mínima (Express + SQLite embutido do Node 22).

## Como rodar

```bash
npm install
npm run build        # gera o site em _site/
npm start            # build + site e API em http://localhost:3000
npm run dev          # só o site, com recarga automática (formulários precisam da API)
npm test             # testes da API (17 testes)
npm run a11y         # axe-core + rolagem horizontal em 360/768/1024/1440 px (requer Playwright)
```

Requer Node.js 22.13 ou superior.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `src/_data/` | Dados editáveis em JSON: contatos, menu, números, equipe, FAQ, datas ambientais |
| `src/noticias`, `eventos`, `documentos`, `projetos`, `servicos` | Um arquivo Markdown por item (editável pelo painel `/admin/`) |
| `src/_includes/` | Layouts e componentes reutilizáveis (cabeçalho, rodapé, cards, campos de formulário) |
| `src/paginas/` | Páginas fixas (Sobre, Contato, Calendário, Transparência…) |
| `src/assets/` | CSS (tokens, base, componentes, alto contraste), JS, imagens |
| `api/` | Servidor: validação, protocolo, uploads, agendamentos, e-mail |
| `docs/` | Mapa do site, fluxos, design system, guias, checklists, conteúdos pendentes |
| `tests/` | Testes da API e verificação de acessibilidade |

## Campos `[●]`

Tudo que depende de informação oficial aparece como **[●]** (destacado em amarelo no site). A lista completa está em [`docs/conteudos-pendentes.md`](docs/conteudos-pendentes.md). Procure no código com `grep -rn "\[●\]" src`.

## Documentação

- [Mapa do site](docs/mapa-do-site.md) e [fluxos por público](docs/fluxos-por-publico.md)
- [Layouts (wireframes)](docs/wireframes.md)
- [Design system](docs/design-system.md)
- [Guia de publicação para servidores](docs/modelo-de-conteudo.md)
- [Conteúdos que a Secretaria precisa fornecer](docs/conteudos-pendentes.md)
- [Checklist de acessibilidade](docs/checklist-acessibilidade.md) · [Checklist mobile](docs/checklist-mobile.md)
- [Hospedagem, backup e LGPD](docs/hospedagem-backup-lgpd.md)

## Variáveis de ambiente da API

`PORT`, `DB_PATH`, `UPLOAD_DIR`, `SMTP_HOST/PORT/USER/PASS/FROM` (sem SMTP, e-mails vão para `api/data/outbox.log`), `NOTIFY_EMAIL`, `ADMIN_TOKEN` (liga as rotas `/api/admin/*`), `HORARIOS`, `VAGAS_POR_HORARIO`, `TRUST_PROXY=1` (atrás de proxy), `CORS_ORIGIN` (se o site e a API ficarem em domínios diferentes; então defina `apiBase` no site).

## Atualização diária

Os "Próximos eventos" são calculados na hora do build. Agende um build diário (por exemplo, `0 3 * * *`) ou publique a cada alteração.

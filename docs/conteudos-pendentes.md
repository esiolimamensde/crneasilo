# Conteúdos que a Secretaria precisa fornecer

Todo texto marcado **[●]** no site precisa ser preenchido com informação oficial antes da publicação. Para listar: `grep -rn "\[●\]" src --include=*.njk --include=*.md --include=*.json`.

> Prazos, taxas e base legal variam conforme a legislação municipal e estadual e **devem ser validados pela área jurídica/técnica**.

| # | Conteúdo | Onde entra | Responsável sugerido |
|---|---|---|---|
| 1 | Missão, visão, valores e histórico oficiais | `_data/missao.json`, `/sobre/` | Gabinete |
| 2 | Base legal de criação e estrutura/organograma | `/sobre/` | Jurídico |
| 3 | Nomes, cargos e fotos da equipe (com autorização) | `_data/equipe.json` | RH / Gabinete |
| 4 | Conselho Municipal (composição, reuniões, atas, lei de criação) | `_data/conselho.json` | Secretaria do CODEMA |
| 5 | Endereço, telefone, telefone de emergência, WhatsApp, e-mail, horário | `_data/site.json` | Gabinete |
| 6 | CNPJ da Secretaria | `site.json` (rodapé) | Administração |
| 7 | Redes sociais (nome e link) | `site.json` | Comunicação |
| 8 | Link do e-SIC, Portal da Transparência, Diário Oficial, Câmara | `site.json`, `navegacao.json` | TI / Transparência |
| 9 | Lista de serviços com requisitos, **prazos e taxas** | `src/servicos/*.md` | Técnico + Jurídico |
| 10 | Base legal de licenças e denúncias; competência municipal (outorgas, certidões) | `src/servicos/*.md` | Jurídico |
| 11 | Ecopontos (endereços, horários, materiais), dias de coleta seletiva | `coleta-destinacao.md` | Resíduos |
| 12 | Números de impacto (APP, árvores, programas, atendimentos) e período | `_data/numeros.json` | Planejamento |
| 13 | Documentos oficiais e publicações (PDF, de preferência acessíveis) | `src/documentos` | Gabinete / Transparência |
| 14 | Orçamento, contratos, convênios e licitações (links) | `/transparencia/` | Finanças / Transparência |
| 15 | Projetos em andamento, resultados e fotos; unidades de conservação; monitoramento água/ar | `src/projetos` | Coordenações |
| 16 | Calendário do ano; Semana do Meio Ambiente e Semana da Água | `src/eventos` | Educação Ambiental |
| 17 | Horários de agendamento e vagas (padrão: seg–sex, 8h–11h e 13h–16h) | variável `HORARIOS` da API | Atendimento |
| 18 | Logotipo oficial (Secretaria e Prefeitura) e manual de identidade visual | cabeçalho, favicon | Comunicação |
| 19 | Fotos reais de Frutal (rios, nascentes, praças, equipes) e créditos | `assets/img`, hero | Comunicação |
| 20 | Textos de privacidade e termos de uso; encarregado de dados (DPO) | `/privacidade/`, `/termos-de-uso/` | Jurídico / DPO |
| 21 | Prazo de resposta para relatos de acessibilidade | `/acessibilidade/` | TI |
| 22 | Dados do SMTP (e-mail de envio) e e-mail que recebe os avisos | variáveis da API | TI |
| 23 | Domínio, hospedagem e política de retenção de dados | `hospedagem-backup-lgpd.md` | TI / Jurídico |

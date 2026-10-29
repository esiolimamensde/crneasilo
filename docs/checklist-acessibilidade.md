# Checklist de acessibilidade (WCAG 2.1 AA / eMAG)

Marque antes de cada publicação. **Automático:** `npm run build && npm run a11y` (axe-core em 43 páginas × 4 larguras + alto contraste; estado atual: 0 violações). O automático cobre ~30–40 % dos critérios; o restante é manual.

## Estrutura e navegação
- [ ] "Pular para o conteúdo" é o primeiro item focável e funciona
- [ ] Landmarks: `header`, `nav` (com nomes), `main`, `footer`; sem conteúdo fora de landmarks
- [ ] Um único `h1` por página; hierarquia sem saltos
- [ ] Breadcrumb em todas as páginas internas
- [ ] Título de página único e descritivo
- [ ] Idioma `pt-BR` declarado
- [ ] Menu principal com no máximo 7 itens + Contato

## Teclado e foco
- [ ] Todo o site funciona só com teclado (Tab, Shift+Tab, Enter, Espaço, Esc, setas na busca)
- [ ] Foco sempre visível (≥ 3 px) e em ordem lógica
- [ ] Menu mobile abre/fecha com teclado e Esc; sem armadilha de foco
- [ ] Busca com sugestões: setas, Enter, Esc; anuncia a quantidade de sugestões
- [ ] Calendário (mês): eventos são botões; diálogo devolve o foco ao fechar

## Visual
- [ ] Contraste ≥ 4,5:1 (texto) e ≥ 3:1 (texto grande, ícones e bordas de campos)
- [ ] Informação nunca só por cor (erros e avisos têm ícone e texto)
- [ ] Zoom 200 % e 400 % sem perda de conteúdo nem rolagem horizontal (exceto tabelas)
- [ ] Texto redimensionável (A−/A/A+) sem quebrar o layout
- [ ] Alto contraste legível em todas as páginas
- [ ] Sem carrossel automático; animações respeitam `prefers-reduced-motion`
- [ ] Alvos de toque ≥ 44 × 44 px

## Conteúdo
- [ ] Imagens informativas com alt descritivo; decorativas com `alt=""`
- [ ] Links com texto compreensível fora de contexto ("Baixar documento: título"); links externos avisam
- [ ] Mapas, gráficos e organogramas têm alternativa em texto
- [ ] PDFs: versão acessível ou aviso de limitação na biblioteca
- [ ] Linguagem simples; siglas explicadas

## Formulários
- [ ] Rótulos visíveis associados (`for`/`id`); instruções antes do campo
- [ ] Obrigatórios indicados por texto (não só asterisco)
- [ ] Erros específicos por campo + resumo no topo com links; foco vai ao resumo
- [ ] Mensagem de confirmação com protocolo, anunciada a leitores de tela (`role=status`, foco)
- [ ] Autocomplete (`name`, `email`, `tel`)
- [ ] Anti-spam sem CAPTCHA visual (honeypot + tempo mínimo + limite de envios)

## Leitores de tela e Libras
- [ ] Teste com NVDA + Firefox/Chrome (Windows), VoiceOver (iOS/macOS) e TalkBack (Android) nas páginas: Início, Serviço, Denúncia, Notícias, Calendário, Documentos, Contato
- [ ] VLibras aparece e abre (online)

## Documentação
- [ ] Declaração de acessibilidade atualizada, com canal para relatar problemas
- [ ] Avaliação por especialista/usuários com deficiência registrada [●]

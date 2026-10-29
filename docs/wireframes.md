# Layouts principais (desktop e mobile)

Wireframes em texto. As telas reais podem ser vistas rodando `npm start`.

## Início
**Desktop (≥1024 px)**
```
[Utilidades: A− A A+ | Alto contraste | Libras ............ e-SIC | Prefeitura]
[Logo  | Busca | Início Sobre Serviços Projetos Notícias Calendário Transparência | (Contato)]
┌──────────────────────── HERO (imagem + texto) ───────────────────────┐
│ Título institucional   [Solicitar um serviço] [Fazer uma denúncia]     │
└────────────────────────────────────────────────────────────────────────┘
O que você procura?  [Licenças][Denúncias][Agendam.][Coleta]  (4×2 atalhos)
Missão | Visão | Valores (3 cards)
Serviços em destaque (4 cards)
Últimas notícias (3 cards)
Próximos eventos (3)          | Frutal em números (4)
Canal de denúncias            | Informações úteis
[Rodapé: links úteis | redes | institucional]  [mapa do site]  [privacidade·termos·acessibilidade·atualização]
```
**Mobile (360 px):** utilidades compactas → logo + botão Menu → **busca fixa** → hero (botões em coluna) → atalhos 2×4 → cards em 1 coluna → rodapé em 1 coluna. Menu hambúrguer abre lista de botões grandes (≥48 px).

## Serviço (modelo)
```
Hero: [Categoria] Título · resumo
┌ O que é ┐┌ Quem pode ┐   ┌ Pronto para solicitar? ┐
┌ Documentos ┐┌ Canal ┐   │ [Iniciar solicitação]   │
┌ Prazo ┐┌ Custo ┐        │ [Consultar protocolo]   │
Como solicitar (1-2-3…)  └─────────────────────────┘
Base legal
```
**Mobile:** coluna única; botão **"Iniciar solicitação" fixo no rodapé da tela**.

## Notícias
Filtros (busca, categoria, de/até) → contador → grade de cards (data, categoria, imagem, resumo; comunicados com selo e número) → [Carregar mais] → newsletter com consentimento.

## Calendário
Destaques (Semana da Água / Meio Ambiente) → filtro de tipo + alternador Lista/Mês → lista (data, tipo, local, [Adicionar ao calendário]) ou grade mensal acessível (tabela) com legenda → diálogo (.ics / Google Agenda).

## Transparência
Cards (Acesso à informação, Documentos) → lista de informações oficiais → biblioteca com filtros (ano, tipo, órgão) → tabela; no mobile vira **lista de cards** (cada linha com rótulo).

## Contato
Formulário (esquerda) | Canais + mapa com alternativa em texto (direita); no mobile: formulário primeiro, canais depois. Aviso LGPD.

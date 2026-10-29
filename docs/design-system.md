# Design system

Arquivos: `src/assets/css/tokens.css` (variáveis), `base.css`, `components.css`, `alto-contraste.css`.

## Cores

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `--verde` | #2E7D32 | Botão primário, destaques | 5,1:1 com branco |
| `--verde-escuro` | #1B5E20 | Hover do primário, números | 7,9:1 com branco |
| `--verde-claro` | #A5D6A7 | Fundos de destaque, badges, ícones | texto escuro 9,0:1 |
| `--azul` | #0277BD | Ícones, bordas, botão secundário em fundo escuro | 4,8:1 com branco |
| `--azul-texto` | #01579B | **Links e botão secundário** | 7,4:1 com branco; 6,9:1 sobre #F5F7F4 |
| `--azul-claro` | #E1F5FE | Seções informativas | — |
| `--texto` | #1F2933 | Texto principal | 13,7:1 |
| `--texto-2` | #52606D | Texto secundário | 6,0:1 sobre #F5F7F4 |
| `--fundo` / `--branco` | #F5F7F4 / #FFF | Fundo / cards | — |
| `--erro` | #C62828 | Erros (sempre com ícone ⚠ e texto) | 5,6:1 |
| `--aviso` | #F9A825 | Avisos: **só como fundo/borda/ícone**, nunca como texto | texto #1F2933 sobre ele: 7,5:1 |

**Desvio justificado:** #0277BD sobre #F5F7F4 dá 4,45:1 (abaixo de 4,5:1). Por isso o texto de links usa `--azul-texto` (#01579B). O #0277BD é usado em ícones e bordas (mínimo 3:1).

## Tipografia
Source Sans 3 (hospedada no próprio site, `font-display: swap`). Corpo 16 px (1 rem) / entrelinha 1,6 / texto corrido limitado a 70 caracteres. H1 `clamp(1.75–2.5rem)`, H2 `1.4–1.875rem`, H3 1,25 rem, H4 1,06 rem. O tamanho cresce com os botões A−/A+ (100 %, 112,5 %, 125 %, 150 %) porque tudo usa `rem`.

## Componentes

| Componente | Classe | Observações |
|---|---|---|
| Botão primário / secundário / terciário | `.btn .btn-primario` `.btn-secundario` `.btn-terciario` | Altura mín. 44 px, verbo claro ("Solicitar", "Fazer denúncia", "Consultar protocolo", "Baixar documento", "Enviar mensagem"). Desabilitado: cinza + borda tracejada |
| Card | `.card`, `.card-link` | Borda sutil, sombra leve; título com link que cobre o card inteiro (área de toque grande) |
| Atalho | `.atalho` | Ícone grande + texto, mín. 120 px de altura |
| Badge | `.badge`, `-azul`, `-aviso`, `-cinza`, `-oficial` | Sempre com texto |
| Alerta | `.alerta-info/-aviso/-erro/-sucesso` | Ícone + título + texto; borda lateral grossa |
| Campo de formulário | macros em `_includes/forms/campos.njk` | Rótulo visível, instrução **antes** do campo, erro específico abaixo (`aria-describedby`, `aria-invalid`), resumo de erros no topo com links |
| Passo a passo | `.passos` | Lista numerada com marcadores circulares |
| Tabela responsiva | `.tabela-wrap` + `.tabela-cards` | Rolagem horizontal controlada; abaixo de 768 px vira lista de cards |
| Calendário | `.cal-tabela`, `.cal-evt` | Tabela com cabeçalhos; eventos são botões |
| Marcador de pendência | `.placeholder` | Aplicado automaticamente a todo `[●]` |
| Ícones | sprite `_includes/components/sprite.njk` + macro `icon()` | Sempre com texto; `aria-hidden` |

## Estados
- **Foco:** contorno de 3 px (`#7A3E00`) + halo branco de 3 px, em todos os elementos interativos.
- **Hover/ativo/desabilitado:** cor de fundo diferente + (desabilitado) borda tracejada, sem depender só de cor.
- **Alto contraste:** classe `.alto-contraste` no `<html>` troca os tokens (fundo preto, texto branco, amarelo e ciano), sublinha links e remove cor das fotos.

## Movimento
Sem carrosséis automáticos. `prefers-reduced-motion` desliga animações e rolagem suave.

## Imagens
WebP/AVIF em produção, `loading="lazy"` (exceto hero), `width`/`height` definidos, `alt` descritivo; decorativas com `alt=""`. As imagens do repositório são **ilustrações provisórias em SVG** — substituir por fotos reais de Frutal [●] e registrar créditos.

# Guia de publicação para servidores

Você não precisa saber programar. Tudo é feito no painel **`/admin/`**.

## Primeiro acesso (para a TI)
1. O repositório está no GitHub. Conceda aos servidores acesso de escrita ao repositório (ou configure um serviço de autenticação OAuth do Decap CMS / Netlify Identity com Git Gateway — veja a documentação do Decap).
2. Em `src/admin/config.yml`, confira `backend.repo` e `branch`.
3. Configure a hospedagem para rebuild a cada alteração na branch principal (`npm run build`) e um build diário (eventos "próximos").
4. Para testar no computador: descomente `local_backend: true`, rode `npx decap-server` e `npm run dev`, abra `http://localhost:8080/admin/`.

## Como publicar
| Quero publicar… | Coleção | Dica |
|---|---|---|
| Uma notícia, aviso, comunicado ou edital | **Notícias e comunicados** | Escolha a categoria. Comunicado oficial: preencha o **número**. Imagem: sempre escreva o **texto alternativo** |
| Uma campanha, evento ou prazo | **Calendário** | Data de término só se durar mais de um dia. Semanas especiais: campo "Destaque" |
| Uma lei, plano, relatório, ata | **Documentos e publicações** | Informe formato e tamanho. Marque "versão acessível" só se o PDF for navegável por leitor de tela |
| Um projeto | **Projetos e ações** | Situação: andamento / concluído / planejado |
| Alterar um serviço | **Serviços** | Passo a passo em frases curtas, verbo no começo |
| Telefone, endereço, horário, números de impacto | **Dados gerais do site** | Troque todos os `[●]` |

## Regras de escrita
- Frases curtas. Explique siglas (APP, LO, CODEMA) na primeira vez.
- Evite termos jurídicos sem explicação.
- Títulos descritivos: "Prazo para renovar licença", não "Aviso".
- Toda imagem informativa precisa de texto alternativo (o que se vê e por que importa).
- PDF: prefira exportar do Word/LibreOffice com títulos e marcação de acessibilidade.

## Fotos e privacidade
Pessoas na equipe só aparecem com autorização; para ocultar a foto, marque `ocultarFoto: true` em `src/_data/equipe.json`. Não publique fotos de crianças sem autorização dos responsáveis.

## Editar arquivos sem o painel
Perguntas frequentes: `src/_data/faq.json` · Equipe: `src/_data/equipe.json` · Conselho: `src/_data/conselho.json` · Datas ambientais: `src/_data/datasAmbientais.json` · Menu e links do rodapé: `src/_data/navegacao.json`.

## Atendimento dos protocolos (TI/gestão)
```bash
# listar
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://SITE/api/admin/protocolos
# mudar a situação (recebido | em_analise | em_atendimento | concluido | arquivado)
curl -X PATCH -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
     -d '{"situacao":"em_analise"}' https://SITE/api/admin/protocolos/SMMA-2026-000001
```
As fotos e anexos ficam em `api/uploads/<protocolo>/`. Denúncias anônimas não guardam nenhum dado de identificação.

# Fluxos de navegação por público

## Cidadão
1. **Denunciar:** Início → "Fazer uma denúncia ambiental" → escolhe identificada ou anônima → tipo de problema → local (endereço + mapa opcional) → descrição e fotos → **protocolo** → (depois) Serviços → Consultar protocolo.
2. **Pedir serviço (poda, muda, licença):** Início → atalho ou Serviços → página do serviço (o que é, quem pode, documentos, passo a passo, prazo, custo) → "Iniciar solicitação" → formulário → protocolo por e-mail e na tela.
3. **Marcar atendimento:** Serviços → Agendamentos → escolhe tipo e data → horários livres → confirma → e-mail de confirmação.
4. **Tirar dúvida:** busca com sugestões, ou Serviços → Orientações (FAQ filtrável por tema).
5. **Acompanhar:** Consultar protocolo (número SMMA-AAAA-NNNNNN).

## Servidor (equipe da Secretaria)
1. Acessa `/admin/` e entra com a conta autorizada.
2. Escolhe a coleção (Notícias, Eventos, Documentos, Projetos, Serviços, Dados gerais) → "Novo" ou edita um item.
3. Preenche os campos (cada um tem uma dica), anexa imagem **com texto alternativo** e arquivos.
4. "Publicar" → o site é reconstruído automaticamente.
5. Protocolos: atualiza a situação pela API administrativa (`PATCH /api/admin/protocolos/:numero`) ou por ferramenta interna da TI. Ver guia em `modelo-de-conteudo.md`.

## Parceiro institucional (ONG, empresa, universidade, órgão público)
1. Início → Projetos e Ações → conhece projetos e parceiros atuais.
2. "Enviar proposta de parceria" → Contato com assunto "Proposta de parceria" já selecionado → protocolo.
3. Transparência → Documentos (planos, editais, atas do Conselho) para entender regras e prazos.
4. Calendário → campanhas e eventos para participar.

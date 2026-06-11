---
title: Variáveis
sidebar_custom_props:
  icon: ph:squares-four-fill
---

import Screenshot from '@site/src/components/Screenshot';

# Importar e preencher variáveis

A aba **Variáveis** é onde você passa a maior parte do tempo.

<Screenshot
  file="aba-variaveis.png"
  alt="Barra lateral — aba Variáveis"
/>

## Importar um .env

Arraste o arquivo na área indicada, clique para escolher no disco ou cole o conteúdo no campo de texto.

<Screenshot
  file="importar-env-dropzone.png"
  alt="Área de dropzone e campo de colar .env"
/>

Cada linha `CHAVE=valor` vira um item na fila. Linhas vazias e comentários (`#`) são ignorados.

## Fila

Depois do import, a lista mostra:

| Coluna | Significado |
|--------|-------------|
| Chave | Nome da variável (com prefixo da aba ativa, se houver) |
| Valor | Conteúdo — mascarado na interface |
| Protected | Se a variável deve ser marcada como protegida no GitLab |

<Screenshot
  file="fila-variaveis.png"
  alt="Fila de variáveis com chave, valor e checkbox Protected"
/>

Você pode remover itens da fila antes de enviar. A fila é só rascunho — nada vai pro GitLab até você clicar em **Preencher na página**.

## Preencher no GitLab

Com a página de variáveis aberta, confira o ambiente ativo (veja [Ambientes](/docs/guia/ambientes)) e clique em **Preencher na página**. A extensão cadastra cada variável da fila, uma por uma.

<Screenshot
  file="preencher-pagina.png"
  alt="Botão Preencher na página e formulário GitLab preenchido"
/>

Se **auto-save** estiver ligado nas configurações, cada variável é salva automaticamente. Caso contrário, você confirma manualmente no GitLab.

## Limpar fila

**Limpar fila** zera a lista local. Não apaga variáveis já salvas no GitLab.

---
title: Ambientes (abas)
sidebar_custom_props:
  icon: ph:cloud-fill
---

import Screenshot from '@site/src/components/Screenshot';

# Abas de ambiente

No topo da barra lateral ficam as abas. Cada uma representa um conjunto de variáveis com prefixo no GitLab.

<Screenshot
  file="abas-ambiente.png"
  alt="Abas Padrão e customizadas na barra lateral"
/>

## Aba Padrão

Sem prefixo. `DATABASE_URL` no `.env` vira `DATABASE_URL` no GitLab.

## Abas customizadas

Ao criar uma aba você define o nome exibido, por exemplo `Production`. As chaves ganham um prefixo derivado desse nome: `Production` vira `production_`, então `API_KEY` passa a ser `production_API_KEY`.

<Screenshot
  file="criar-aba.png"
  alt="Diálogo para criar nova aba de ambiente"
/>

O prefixo segue o padrão que muitos times usam no GitLab para separar variáveis por ambiente na mesma tela.

## Trocar de aba

A fila e as ações respeitam a aba ativa. Troque de aba antes de importar ou preencher se quiser outro prefixo.

## Remover aba

Abas customizadas podem ser removidas. A aba **Padrão** não sai. Remover aba não apaga variáveis já cadastradas no GitLab.

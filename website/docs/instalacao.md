---
sidebar_position: 2
title: Instalação
---

import Screenshot from '@site/src/components/Screenshot';

# Instalação

## Chrome Web Store

Quando a extensão estiver publicada, instale pelo link oficial da loja. Esta documentação será atualizada com o URL.

## Modo desenvolvedor (build local)

1. Clone o repositório e instale dependências na raiz do projeto:

```bash
npm install
npm run build
```

2. Abra `chrome://extensions` (ou `edge://extensions`).
3. Ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação** e selecione a pasta `dist` gerada pelo build.

<Screenshot
  file="chrome-extensoes-carregar.png"
  alt="Chrome extensions — Carregar sem compactação apontando para dist"
/>

5. Fixe a extensão na barra se quiser acesso rápido ao popup.

<Screenshot
  file="popup-extensao.png"
  alt="Popup da extensão com toggle do botão flutuante"
  caption="No popup você liga ou desliga o botão flutuante nas páginas do GitLab."
/>

## Onde usar

Abra o projeto no GitLab e vá em **Settings → CI/CD → Variables** (ou o caminho equivalente na sua versão).

<Screenshot
  file="gitlab-menu-variables.png"
  alt="Menu do GitLab até CI/CD Variables"
/>

O botão flutuante **VIZIOON** aparece no canto da página. Clique para abrir a barra lateral.

Depois da instalação, siga o [guia de variáveis](/docs/guia/variaveis).

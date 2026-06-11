---
sidebar_position: 2
title: Instalação
sidebar_custom_props:
  icon: ph:download-simple-fill
---

import Screenshot from '@site/src/components/Screenshot';

# Instalação

## Baixar e instalar

Confira os [navegadores compatíveis](/docs/navegadores). Depois, na página [Versões](/docs/versoes), baixe a release desejada.

1. Baixe o arquivo da versão desejada.
2. Extraia o conteúdo do zip.
3. Abra `chrome://extensions` (Chrome) ou `edge://extensions` (Edge).
4. Ative **Modo do desenvolvedor**.
5. Clique em **Carregar sem compactação** e selecione a pasta extraída.

## Chrome Web Store

Em breve também pela Chrome Web Store ou Microsoft Edge Add-ons.

<Screenshot
  file="popup-extensao.png"
  alt="Popup da extensão"
  caption="Pelo ícone na barra do navegador você liga o botão flutuante nas páginas do GitLab."
/>

## Primeiro uso

1. Abra o projeto no GitLab e vá em **Settings → CI/CD → Variables**.
2. Ative a extensão no popup (toggle na barra do navegador).
3. Na primeira ativação, leia e confirme o aviso de privacidade.
4. Clique no botão **VIZIOON** que aparece na página para abrir a barra lateral.

<Screenshot
  file="gitlab-variables-pagina.png"
  alt="Página de variáveis do GitLab com botão VIZIOON"
/>

<Screenshot
  file="gitlab-menu-variables.png"
  alt="Caminho até CI/CD Variables no GitLab"
/>

Depois da instalação, siga o [guia de variáveis](/docs/guia/variaveis).

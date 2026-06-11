import type { ReactNode } from 'react'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

type ScreenshotProps = {
  /** Caminho em static/img/screenshots/ — ex: variaveis-fila.png */
  file?: string
  alt: string
  caption?: string
}

export default function Screenshot({ file, alt, caption }: ScreenshotProps): ReactNode {
  const src = file ? useBaseUrl(`/img/screenshots/${file}`) : null

  if (src) {
    return (
      <figure className="screenshot-figure">
        <img src={src} alt={alt} loading="lazy" />
        {(caption || alt) && <figcaption>{caption ?? alt}</figcaption>}
      </figure>
    )
  }

  const suggested = file ?? 'nome-do-arquivo.png'

  return (
    <div className="screenshot-placeholder">
      <div className="screenshot-placeholder__frame">
        <svg
          className="screenshot-placeholder__icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
        <span className="screenshot-placeholder__label">{alt}</span>
        <code className="screenshot-placeholder__path">static/img/screenshots/{suggested}</code>
      </div>
      {caption && <p className="screenshot-placeholder__caption">{caption}</p>}
    </div>
  )
}

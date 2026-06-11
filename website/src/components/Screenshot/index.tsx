import type { ReactNode } from 'react'
import useBaseUrl from '@docusaurus/useBaseUrl'

type ScreenshotProps = {
  file?: string
  alt: string
  caption?: string
}

export default function Screenshot({ file, alt, caption }: ScreenshotProps): ReactNode {
  const src = file ? useBaseUrl(`/img/screenshots/${file}`) : null

  if (!src) return null

  return (
    <figure className="screenshot-figure">
      <img src={src} alt={alt} loading="lazy" />
      {(caption || alt) && <figcaption>{caption ?? alt}</figcaption>}
    </figure>
  )
}

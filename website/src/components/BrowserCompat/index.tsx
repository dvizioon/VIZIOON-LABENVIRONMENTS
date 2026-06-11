import { Icon } from '@iconify/react'

type Browser = {
  name: string
  icon: string
  compatible: boolean
}

const BROWSERS: Browser[] = [
  { name: 'Google Chrome', icon: 'logos:chrome', compatible: true },
  { name: 'Microsoft Edge', icon: 'logos:microsoft-edge', compatible: true },
  { name: 'Brave', icon: 'logos:brave', compatible: true },
  { name: 'Opera', icon: 'logos:opera', compatible: true },
  { name: 'Arc', icon: 'simple-icons:arc', compatible: true },
  { name: 'Mozilla Firefox', icon: 'logos:firefox', compatible: false },
  { name: 'Safari', icon: 'logos:safari', compatible: false },
]

function BrowserCard({ browser }: { browser: Browser }) {
  return (
    <article
      className={`browser-card${browser.compatible ? '' : ' browser-card--unsupported'}`}
    >
      <Icon icon={browser.icon} className="browser-card__icon" aria-hidden />
      <p className="browser-card__name">{browser.name}</p>
      <span
        className={`browser-badge${browser.compatible ? ' browser-badge--ok' : ' browser-badge--no'}`}
      >
        {browser.compatible ? 'Compatível' : 'Não compatível'}
      </span>
    </article>
  )
}

export default function BrowserCompat() {
  const supported = BROWSERS.filter((b) => b.compatible)
  const unsupported = BROWSERS.filter((b) => !b.compatible)

  return (
    <div className="browser-compat">
      <section className="browser-compat__section">
        <h2 className="browser-compat__heading">Funciona nestes navegadores</h2>
        <div className="browser-grid">
          {supported.map((browser) => (
            <BrowserCard key={browser.name} browser={browser} />
          ))}
        </div>
      </section>

      <section className="browser-compat__section">
        <h2 className="browser-compat__heading">Ainda não suportados</h2>
        <div className="browser-grid browser-grid--compact">
          {unsupported.map((browser) => (
            <BrowserCard key={browser.name} browser={browser} />
          ))}
        </div>
      </section>
    </div>
  )
}

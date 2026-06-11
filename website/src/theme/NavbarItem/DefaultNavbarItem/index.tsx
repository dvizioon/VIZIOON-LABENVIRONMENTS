import React from 'react'
import Original from '@theme-original/NavbarItem/DefaultNavbarItem'
import { Icon } from '@iconify/react'
import type { Props } from '@theme/NavbarItem/DefaultNavbarItem'

export default function DefaultNavbarItem(props: Props): React.ReactNode {
  if (props.className?.includes('navbar-github-link')) {
    return (
      <Original
        {...props}
        label={
          <span className="navbar-github-link__label">
            <Icon icon="simple-icons:github" className="navbar-github-link__icon" aria-hidden />
            <span className="sr-only">GitHub</span>
          </span>
        }
      />
    )
  }

  return <Original {...props} />
}

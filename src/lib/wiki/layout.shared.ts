import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: 'yusing',
  repo: 'godoxy',
  branch: 'main',
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'GoDoxy',
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  }
}

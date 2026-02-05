export const siteConfig = {
  metadata: {
    title: process.env.NODE_ENV === 'development' ? 'GoDoxy (dev)' : 'GoDoxy',
    description: 'Beyond a reverse proxy',
  },
  links: {
    github: 'https://github.com/yusing/godoxy',
    discord: 'https://discord.gg/umReR62nRd',
  },
} as const

export const siteConfig = {
  metadata: {
    title: "GoDoxy WebUI",
    description: "WebUI for GoDoxy",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  },
  navItems: [
    { label: "Dashboard", href: "/" },
    { label: "Config Editor", href: "/config_editor" },
    { label: "Proxies", href: "/proxies" },
    { label: "Metrics", href: "/metrics", bg: "unset" },
    { label: "Docker", href: "/docker" },
    { label: "Wiki", href: "/wiki/Home" },
  ],
  links: {
    github: "https://github.com/yusing/go-proxy",
    discord: "https://discord.gg/umReR62nRd",
  },
} as const;

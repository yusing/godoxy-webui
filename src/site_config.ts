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
    { label: "Logs", href: "/logs" },
    { label: "Docs", href: "/docs/Home" },
  ],
  links: {
    github: "https://github.com/yusing/go-proxy",
    discord: "https://discord.gg/umReR62nRd",
  },
} as const;

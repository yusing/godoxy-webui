export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Go Proxy Web Panel",
  description: "Manage your reverse proxies in an elegant way.",
  navItems: [
    {
      label: "Dashboard",
      href: "/",
    },
    {
      label: "Config",
      href: "/config_editor",
    },
    {
      label: "Proxies",
      href: "/proxies",
    },
    // {
    //   label: "Docs",
    //   href: "/docs",
    // },
    // {
    //   label: "About",
    //   href: "/about",
    // },
  ],
  links: {
    github: "https://github.com/yusing/go-proxy",
    // docs: "https://nextui.org",
    // discord: "https://discord.gg/9b6yyZKmH4",
    // sponsor: "https://patreon.com/jrgarciadev",
  },
};

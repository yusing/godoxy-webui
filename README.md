# GoDoxy WebUI

This is the frontend for [GoDoxy](https://github.com/yusing/godoxy).

Production builds write static client assets to `dist/client`. The parent GoDoxy module embeds that directory via `embed.go` and serves it as the built-in WebUI `fileserver` route, so the normal deployment path does not need a separate frontend container or standalone WebUI image.

Embedded builds prerender every MDX documentation page and its raw-MDX endpoint,
including pages outside the sidebar navigation. Documentation links are resolved
relative to their source file. A failed prerender request fails the build; raw-MDX
examples are not crawled as HTML links.

Apps and Routes support aliases such as `keys`, `value`, and `constructor`, as well as dotted
hostnames. Missing health or uptime data displays as unknown and updates when
metrics arrive.

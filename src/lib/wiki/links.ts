export function resolveDocHref(href: string, sourcePath: string): string {
  if (!href.startsWith('./') && !href.startsWith('../')) return href

  // Keep index.mdx in the base so sibling links resolve from the source directory.
  const url = new URL(href, `https://docs.godoxy.dev/docs/${sourcePath}`)
  const path = url.pathname.replace(/\.mdx?$/, '').replace(/\/index$/, '')
  return `${path}${url.search}${url.hash}`
}

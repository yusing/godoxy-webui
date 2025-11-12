function toTitleCase(str: string) {
  if (!str) return ''
  if (str.length === 1) return str.toUpperCase()
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export { toTitleCase }

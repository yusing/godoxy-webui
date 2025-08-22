import { headers } from 'next/headers'

export async function getPathname() {
  const headersList = await headers()
  return headersList.get('x-path')
}

export async function getUrl() {
  const headersList = await headers()
  return headersList.get('x-url')
}

import type { MiddlewareComposeItem } from './middlewares'

export type MiddlewareCompose = { [key: string]: MiddlewareComposeItem[] }
export type EntrypointMiddlewares = MiddlewareComposeItem[]

import { MiddlewareComposeMap } from "./middlewares";

export type MiddlewareCompose = { [key: string]: MiddlewareComposeMap[] };
export type EntrypointMiddlewares = MiddlewareComposeMap[];

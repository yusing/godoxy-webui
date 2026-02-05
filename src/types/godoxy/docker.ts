import type { IdleWatcherConfig } from './providers/idlewatcher'
import type { Route } from './providers/routes'

//FIXME: fix this
export type DockerRoutes = {
  [key: string]: Route & IdleWatcherConfig
}

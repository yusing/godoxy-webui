import type * as AccessLog from './config/access_log'
import type * as ACL from './config/acl'
import type * as Autocert from './config/autocert'
import type * as Config from './config/config'
import type * as Entrypoint from './config/entrypoint'
import type * as Maxmind from './config/maxmind'
import type * as Notification from './config/notification'
import type * as Providers from './config/providers'

import type * as MiddlewareCompose from './middlewares/middleware_compose'
import type * as Middlewares from './middlewares/middlewares'

import type * as Healthcheck from './providers/healthcheck'
import type * as Homepage from './providers/homepage'
import type * as IdleWatcher from './providers/idlewatcher'
import type * as LoadBalance from './providers/loadbalance'
import type * as Proxmox from './providers/proxmox'
import type * as Routes from './providers/routes'

import type * as GoDoxy from './types'

import _ACLSchema from './acl.schema.json'
import _AutocertSchema from './autocert.schema.json'
import _ConfigSchema from './config.schema.json'
import _DockerRoutesSchema from './docker_routes.schema.json'
import _MaxmindSchema from './maxmind.schema.json'
import _MiddlewareComposeSchema from './middleware_compose.schema.json'
import _RoutesSchema from './routes.schema.json'

// import dereferenced schemas as type
// but offload dereferencing to the client
import type ACLSchemaDeref from './acl.schema.deref.json'
import type AutocertSchemaDeref from './autocert.schema.deref.json'
import type ConfigSchemaDeref from './config.schema.deref.json'
import type DockerRoutesSchemaDeref from './docker_routes.schema.deref.json'
import type MaxmindSchemaDeref from './maxmind.schema.deref.json'
import type MiddlewareComposeSchemaDeref from './middleware_compose.schema.deref.json'
import type RoutesSchemaDeref from './routes.schema.deref.json'

import $ from '@apidevtools/json-schema-ref-parser'

const ACLSchema = (await $.dereference(_ACLSchema)) as typeof ACLSchemaDeref
const AutocertSchema = (await $.dereference(_AutocertSchema)) as typeof AutocertSchemaDeref
const ConfigSchema = (await $.dereference(_ConfigSchema)) as typeof ConfigSchemaDeref
const DockerRoutesSchema = (await $.dereference(
  _DockerRoutesSchema
)) as typeof DockerRoutesSchemaDeref
const MaxmindSchema = (await $.dereference(_MaxmindSchema)) as typeof MaxmindSchemaDeref
const MiddlewareComposeSchema = (await $.dereference(
  _MiddlewareComposeSchema
)) as typeof MiddlewareComposeSchemaDeref
const RoutesSchema = (await $.dereference(_RoutesSchema)) as typeof RoutesSchemaDeref

export {
  ACLSchema,
  AutocertSchema,
  ConfigSchema,
  DockerRoutesSchema,
  MaxmindSchema,
  MiddlewareComposeSchema,
  RoutesSchema,
  type AccessLog,
  type ACL,
  type Autocert,
  type Config,
  type Entrypoint,
  type GoDoxy,
  type Healthcheck,
  type Homepage,
  type IdleWatcher,
  type LoadBalance,
  type Maxmind,
  type MiddlewareCompose,
  type Middlewares,
  type Notification,
  type Providers,
  type Proxmox,
  type Routes
}

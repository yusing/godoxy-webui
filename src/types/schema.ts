import {
  ConfigSchema,
  MiddlewareComposeSchema,
  RoutesSchema,
} from "godoxy-schemas";

export type Schema =
  | typeof ConfigSchema
  | typeof RoutesSchema
  | typeof MiddlewareComposeSchema;

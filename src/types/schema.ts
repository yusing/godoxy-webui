import {
  ConfigSchema,
  MiddlewareComposeSchema,
  RoutesSchema,
} from "@/types/godoxy";

export type Schema =
  | typeof ConfigSchema
  | typeof RoutesSchema
  | typeof MiddlewareComposeSchema;

export function getSchemaDescription(
  definitions: Record<string, { description: string } | Record<string, any>>,
) {
  return Object.entries(definitions).reduce(
    (acc, [k, v]) => {
      if ("description" in v) {
        acc[k] = v.description;
      }
      return acc;
    },
    {} as Record<string, string>,
  );
}

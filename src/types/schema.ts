import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import {
  ConfigSchema,
  MiddlewareComposeSchema,
  RoutesSchema,
} from "godoxy-schemas";
import { type ConfigFileType } from "./api/endpoints";

export const ajv = new Ajv({
  allErrors: true,
  allowUnionTypes: true,
  validateFormats: true,
  allowMatchingProperties: true,
  strict: false,
  useDefaults: true,
});
addFormats(ajv);

export type Schema =
  | typeof ConfigSchema
  | typeof RoutesSchema
  | typeof MiddlewareComposeSchema;

const validators = {
  config: ajv.compile(ConfigSchema),
  provider: ajv.compile(RoutesSchema),
  middleware: ajv.compile(MiddlewareComposeSchema),
};

export function getValidator(fileType: ConfigFileType): ValidateFunction {
  return validators[fileType];
}

export function getRegexValidator(
  pattern: string,
): ((value: string) => boolean) | undefined {
  try {
    const regex = new RegExp(pattern);
    return (value: string) => regex.test(value);
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

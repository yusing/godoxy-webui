import Ajv from "ajv";
import addFormats from "ajv-formats";
import Endpoints, { type ConfigFileType } from "./api/endpoints";

export const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateFormats: true,
  useDefaults: true,
});
addFormats(ajv);

export function getSchemaFilename(fileType: ConfigFileType) {
  if (fileType == "config") return "config.schema.json";
  if (fileType == "provider") return "routes.schema.json";
  return "middleware_compose.schema.json";
}

export function fetchSchema(fileType: ConfigFileType) {
  return fetch(Endpoints.Schema(getSchemaFilename(fileType)));
}

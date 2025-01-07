import Ajv from "ajv";
import addFormats from "ajv-formats";
import path from "path";
import Endpoints, { fetchEndpoint, FileType } from "./endpoints";

const ajv = new Ajv({
  allErrors: true,
  loadSchema: _loadSchema,
  strict: false,
  validateFormats: true,
});
addFormats(ajv);

async function _loadSchema(uri: string) {
  const filename = path.basename(uri);
  return fetchEndpoint(Endpoints.Schema(filename)).then((r) => r.json());
}

export function loadSchema(fileType: FileType) {
  const filename =
    fileType == "config" ? "config.schema.json" : "providers.schema.json";
  return ajv.compileAsync({ $ref: `/${Endpoints.Schema(filename)}` });
}

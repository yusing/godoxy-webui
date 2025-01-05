import Ajv from "ajv"
import addFormats from "ajv-formats"
import path from "path"
import Endpoints, { checkResponse, fetchEndpoint } from "./endpoints"

const ajv = new Ajv({
  allErrors: true,
  loadSchema: _loadSchema,
  strict: false,
  validateFormats: true
})
addFormats(ajv)

async function _loadSchema(uri: string) {
  const filename = path.basename(uri)
  const res = await fetchEndpoint(Endpoints.Schema(filename));
  await checkResponse(res);
  return await res.json()
}

export function loadSchema(filename: string) {
  return ajv.compileAsync({$ref: `/${Endpoints.Schema(filename)}`})
}
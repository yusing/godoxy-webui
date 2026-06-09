import rulesCheatsheet from '../../generated/rules-cheatsheet.json'

export {
  controlKeywords,
  patternFunctions,
  httpMethods,
  protocolAtoms,
  logLevels,
  mutationActions,
  mutationFieldKeywords,
  staticVariables,
  dynamicVariableFunctions,
  conditionKeywords,
  actionKeywords,
  commandOptionFields,
}

type RulesCheatsheetEntry = {
  kind?: string
  name?: string
  args?: { name: string; description?: string }[]
}

type RulesCheatsheet = {
  sections: { entries: RulesCheatsheetEntry[] }[]
}

const conditionKeywords = new Set([
  'header',
  'query',
  'cookie',
  'form',
  'postform',
  'post_form',
  'proto',
  'method',
  'host',
  'path',
  'remote',
  'route',
  'basic_auth',
  'status',
  'resp_header',
])

const actionKeywords = new Set([
  'upstream',
  'pass',
  'bypass',
  'require_auth',
  'rewrite',
  'serve',
  'serve_file',
  'handle',
  'proxy',
  'route',
  'redirect',
  'error',
  'require_basic_auth',
  'set',
  'add',
  'remove',
  'log',
  'notify',
])

const controlKeywords = new Set(['default', 'elif', 'else'])
const patternFunctions = new Set(['glob', 'regex'])
const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'CONNECT', 'HEAD', 'OPTIONS', 'TRACE']
const protocolAtoms = ['http', 'https', 'h1', 'h2', 'h2c', 'h3']
const logLevels = ['debug', 'info', 'warn', 'error', 'fatal']
const mutationActions = new Set(['set', 'add', 'remove'])
const mutationFieldKeywords = new Set([
  'header',
  'resp_header',
  'query',
  'cookie',
  'body',
  'resp_body',
  'status',
])

const staticVariables = [
  'req_method',
  'req_scheme',
  'req_host',
  'req_port',
  'req_addr',
  'req_path',
  'req_query',
  'req_url',
  'req_uri',
  'req_content_type',
  'req_content_length',
  'remote_host',
  'remote_port',
  'remote_addr',
  'status_code',
  'resp_content_type',
  'resp_content_length',
  'upstream_name',
  'upstream_scheme',
  'upstream_host',
  'upstream_port',
  'upstream_addr',
  'upstream_url',
]

const dynamicVariableFunctions = [
  'header',
  'resp_header',
  'cookie',
  'arg',
  'form',
  'postform',
  'redacted',
]

const commandOptionFields = new Map<string, { name: string; description?: string }[]>()

for (const section of (rulesCheatsheet as RulesCheatsheet).sections) {
  for (const entry of section.entries) {
    if (entry.kind !== 'command' || !entry.name || !entry.args) continue
    commandOptionFields.set(entry.name, entry.args)
  }
}

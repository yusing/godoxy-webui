import type {
  CIDR,
  HTTPCookie,
  HTTPHeader,
  HTTPMethod,
  HTTPQuery,
  LogLevel,
  StatusCode,
  Template,
  URI,
  URL,
} from '../types'

/**
 * Rule on
 *
 * @examples [
 *   "header Content-Type application/json",
 *   "query key value",
 *   "cookie key value",
 *   "form key value",
 *   "post_form key value",
 *   "method GET",
 *   "path glob(/api/*)",
 *   "remote 127.0.0.1",
 *   "route immich",
 *   "basic_auth admin $2y$05$N3ZiFNDXVSMZ/OtcuSzGrOEBp15dqw6kQ9OJWvJSlgi9/zJ9LuCrm",
 *   "rewrite / /index.html",
 *   "serve /static",
 *   "proxy http://localhost:8080",
 *   "redirect https://example.com",
 *   "redirect /index.html",
 *   "error 404 \"Not Found\"",
 *   "require_basic_auth \"Restricted Area\"",
 *   "set headers Content-Type application/json",
 *   "add headers Content-Type application/json",
 *   "remove headers Content-Type",
 *   "pass"
 * ]
 */
export type RuleOn =
  | RuleOnHeader
  | RuleOnQuery
  | RuleOnCookie
  | RuleOnForm
  | RuleOnPostForm
  | RuleOnHost
  | RuleOnMethod
  | RuleOnPath
  | RuleOnRemote
  | RuleOnRoute
  | RuleOnBasicAuth
  | RuleOnStatusCode
  | RuleOnResponseHeader

type RulePattern = `regex(${string})` | `glob(${string})` | (string & {})

type OptionalPattern<T extends string> = T | `${T} ${RulePattern}`

/**
 * header {key} [{value}]
 *
 * When value is provided, match the request header with the given key and value pattern.
 * Otherwise, match the request header when the given key exists.
 *
 * @examples ["header Content-Type", "header Content-Type application/json"]
 */
type RuleOnHeader = OptionalPattern<`header ${HTTPHeader}`>
/**
 * query {key} [{value}]
 *
 * When value is provided, match the request query with the given key and value pattern.
 * Otherwise, match the request query when the given key exists.
 *
 * @examples ["query key", "query key value"]
 */
type RuleOnQuery = OptionalPattern<`query ${HTTPQuery}`>
/**
 * cookie {key} [{value}]
 *
 * When value is provided, match the request cookie with the given key and value pattern.
 * Otherwise, match the request cookie when the given key exists.
 *
 * @examples ["cookie key", "cookie key value"]
 */
type RuleOnCookie = OptionalPattern<`cookie ${HTTPCookie}`>
/**
 * form {key} [{value}]
 *
 * When value is provided, match the request form with the given key and value pattern.
 * Otherwise, match the request form when the given key exists.
 *
 * @examples ["form key value"]
 */
type RuleOnForm = OptionalPattern<`form ${string}`>
/**
 * post_form {key} [{value}]
 *
 * When value is provided, match the request post form with the given key and value pattern.
 * Otherwise, match the request post form when the given key exists.
 *
 * @examples ["post_form key value"]
 */
type RuleOnPostForm = OptionalPattern<`post_form ${string}`>
/**
 * method {http_method}
 *
 * Match the request method with the given method.
 *
 * @examples ["method GET"]
 */
type RuleOnMethod = `method ${HTTPMethod}`
/**
 * host {host}
 *
 * Match the request host with the given host pattern.
 *
 * @examples ["host example.com"]
 */
type RuleOnHost = `host ${RulePattern}`
/**
 * path {glob_pattern}
 *
 * Match the request path with the given path pattern.
 *
 * @examples ["path glob(/api/*)", "path regex(/api/[^/]+)", "path /exact"]
 */
type RuleOnPath = `path ${RulePattern}`
/**
 * remote {ip|cidr}
 *
 * Match the request remote address with the given IP or CIDR.
 *
 * @examples ["remote 127.0.0.1"]
 */
type RuleOnRemote = `remote ${CIDR}`
/**
 * route {alias}
 *
 * Match the request route with the given alias pattern.
 *
 * @examples ["route immich", "route regex(\w+)"]
 */
type RuleOnRoute = `route ${RulePattern}`
/**
 * basic_auth {username} {bcrypt_hashed_password}
 *
 * Match the request basic authentication with the given username and bcrypt hashed password.
 *
 * @examples ["basic_auth admin $2y$05$N3ZiFNDXVSMZ/OtcuSzGrOEBp15dqw6kQ9OJWvJSlgi9/zJ9LuCrm"]
 */
type RuleOnBasicAuth = `basic_auth ${string} ${string}`
/**
 * status {status_code}
 * status {status_code}-{status_code}
 * status {1|2|3|4|5}xx
 *
 * Match the request status code with the given status code.
 *
 * @examples ["status 404", "status 200-300", "status 2xx"]
 */
type RuleOnStatusCode =
  | `status ${StatusCode}`
  | `status ${StatusCode}-${StatusCode}`
  | `status ${1 | 2 | 3 | 4 | 5}xx`
/**
 * resp_header {key} [{value}]
 *
 * When value is provided, match the response header with the given key and value pattern.
 * Otherwise, match the response header when the given key exists.
 *
 * @examples ["resp_header Content-Type", "resp_header Content-Type application/json"]
 */
type RuleOnResponseHeader = OptionalPattern<`resp_header ${HTTPHeader}`>

/**
 * Rule do
 *
 * @examples [
 *   "rewrite / /index.html",
 *   "serve /static",
 *   "proxy http://localhost:8080",
 *   "redirect https://example.com",
 *   "redirect /index.html",
 *   "error 404 \"Not Found\"",
 *   "require_basic_auth \"Restricted Area\"",
 *   "set headers Content-Type application/json",
 *   "add headers Content-Type application/json",
 *   "remove headers Content-Type",
 *   "pass"
 * ]
 */
export type RuleDo =
  | RuleDoRewrite
  | RuleDoServe
  | RuleDoProxy
  | RuleDoRedirect
  | RuleDoError
  | RuleDoRequireBasicAuth
  | RuleDoSet
  | RuleDoAdd
  | RuleDoRemove
  | RuleDoLog
  | RuleDoNotify
  | RuleDoPass

/**
 * rewrite {path_from} {path_to}
 *
 * Rewrite the request path to the given path.
 *
 * @examples ["rewrite / /index.html"]
 */
type RuleDoRewrite = `rewrite ${URI} ${URI}`
/**
 * serve {path_to}
 *
 * Serve the request from the given path.
 *
 * @examples ["serve /static"]
 */
type RuleDoServe = `serve ${URI}`
/**
 * proxy {url}
 *
 * Proxy the request to the given URL.
 *
 * @examples ["proxy http://localhost:8080", "proxy /api/v1/"]
 */
type RuleDoProxy = `proxy ${URL | URI}`
/**
 * redirect {url|path}
 *
 * Redirect the request to the given URL or path.
 *
 * @examples ["redirect https://example.com", "redirect /index.html"]
 */
type RuleDoRedirect = `redirect ${URL | URI}`
/**
 * error {status_code} {message}
 *
 * Return the given status code and message.
 *
 * @examples ["error 404 \"Not Found\""]
 */
type RuleDoError = `error ${StatusCode} ${string}`
/**
 * require_basic_auth {realm}
 *
 * Require basic authentication with the given realm.
 *
 * @examples ["require_basic_auth \"Restricted Area\""]
 */
type RuleDoRequireBasicAuth = `require_basic_auth ${string}`
/**
 * set {field} {key} {value}
 *
 * Set the given field to the given value.
 *
 * @examples ["set headers Content-Type application/json"]
 */
type RuleDoSet = `set ${RuleModifyTarget}`
/**
 * add {field} {key} {value}
 *
 * Add the given value to the given field.
 *
 * @examples ["add headers Content-Type application/json"]
 */
type RuleDoAdd = `add ${RuleModifyTarget}`
/**
 * remove {field} {key}
 *
 * Remove the given key from the given field.
 *
 * @examples ["remove headers Content-Type"]
 */
type RuleDoRemove = `remove ${RuleModifyTarget}`
/**
 * log {level} {path} {template}
 *
 * Log the given level, path and template.
 * For stdout and stderr, use /dev/stdout and /dev/stderr respectively.
 *
 * @examples ["log info /dev/stdout \"{{ .Request.Method }} {{ .Request.URL }} {{ .Response.StatusCode }}\""]
 */
type RuleDoLog = `log ${LogLevel} ${string} ${Template}`
/**
 * notify {level} {service_name} {template}
 *
 * Notify the given level, service name and template. Service must be in `providers.notification`
 *
 * @examples ["notify info ntfy \"Received request to {{ .Request.URL }}\" \"{{ .Request.Method }} {{ .Response.StatusCode }}\""]
 */
type RuleDoNotify = `notify ${LogLevel} ${string} ${Template}`
/**
 * pass
 *
 * Skip and continue to the next handler (e.g. upstream server)
 *
 */
type RuleDoPass = `pass`

/**
 * Field
 *
 * The field to operate on.
 */

type RuleModifyTarget =
  | RuleModifyHeader
  | RuleModifyResponseHeader
  | RuleModifyQuery
  | RuleModifyCookie
  | RuleModifyBody
  | RuleModifyResponseBody
  | RuleModifyStatusCode

/**
 * header {key} {template}
 */
type RuleModifyHeader = `header ${HTTPHeader} ${Template}`
/**
 * resp_header {key} {template}
 */
type RuleModifyResponseHeader = `resp_header ${HTTPHeader} ${Template}`
/**
 * query {key} {template}
 */
type RuleModifyQuery = `query ${HTTPQuery} ${Template}`
/**
 * cookie {key} {template}
 */
type RuleModifyCookie = `cookie ${HTTPCookie} ${Template}`
/**
 * body {template}
 */
type RuleModifyBody = `body ${Template}`
/**
 * resp_body {template}
 */
type RuleModifyResponseBody = `resp_body ${Template}`
/**
 * status_code {template}
 */
type RuleModifyStatusCode = `status_code ${StatusCode}`

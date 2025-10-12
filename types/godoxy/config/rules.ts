import type {
  CIDR,
  HTTPCookie,
  HTTPHeader,
  HTTPMethod,
  HTTPQuery,
  StatusCode,
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
 *   "path /api/*",
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
  | RuleOnHeaderAnyValue
  | RuleOnQuery
  | RuleOnQueryAnyValue
  | RuleOnCookie
  | RuleOnCookieAnyValue
  | RuleOnForm
  | RuleOnFormAnyValue
  | RuleOnPostForm
  | RuleOnPostFormAnyValue
  | RuleOnHost
  | RuleOnMethod
  | RuleOnPath
  | RuleOnRemote
  | RuleOnRoute
  | RuleOnBasicAuth

type RulePattern = `regex(${string})` | `glob(${string})` | (string & {})

/**
 * header {key} {value}
 *
 * Match the request header with the given key and value pattern.
 *
 * @examples ["header Content-Type application/json"]
 */
type RuleOnHeader = `header ${HTTPHeader} ${RulePattern}`
/**
 * header {key}
 *
 * Match the request header with the given key.
 *
 * @examples ["header Content-Type"]
 */
type RuleOnHeaderAnyValue = `header ${HTTPHeader}`
/**
 * query {key} {value}
 *
 * Match the request query with the given key and value pattern.
 *
 * @examples ["query key value"]
 */
type RuleOnQuery = `query ${HTTPQuery} ${RulePattern}`
/**
 * query {key}
 *
 * Match the request query with the given key.
 *
 * @examples ["query key"]
 */
type RuleOnQueryAnyValue = `query ${HTTPQuery}`
/**
 * cookie {key} {value}
 *
 * Match the request cookie with the given key and value pattern.
 *
 * @examples ["cookie key value"]
 */
type RuleOnCookie = `cookie ${HTTPCookie} ${RulePattern}`
/**
 * cookie {key}
 *
 * Match the request cookie with the given key.
 *
 * @examples ["cookie key"]
 */
type RuleOnCookieAnyValue = `cookie ${HTTPCookie}`
/**
 * form {key} {value}
 *
 * Match the request form with the given key and value pattern.
 *
 * @examples ["form key value"]
 */
type RuleOnForm = `form ${string} ${RulePattern}`
/**
 * form {key}
 *
 * Match the request form with the given key.
 *
 * @examples ["form key"]
 */
type RuleOnFormAnyValue = `form ${string}`
/**
 * post_form {key} {value}
 *
 * Match the request post form with the given key and value pattern.
 *
 * @examples ["post_form key value"]
 */
type RuleOnPostForm = `post_form ${string} ${RulePattern}`
/**
 * post_form {key}
 *
 * Match the request post form with the given key.
 *
 * @examples ["post_form key"]
 */
type RuleOnPostFormAnyValue = `post_form ${string}`
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
 * @examples ["path glob(/api/*)", "path regex(/api/[^/]+)", "path /exact")]
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
 * @examples ["proxy http://localhost:8080"]
 */
type RuleDoProxy = `proxy ${URL}`
/**
 * redirect {url|path}
 *
 * Redirect the request to the given URL or path.
 *
 * @examples ["redirect https://example.com", "redirect /index.html"]
 */
type RuleDoRedirect = `redirect ${URL}` | `redirect ${URI}`
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
type RuleDoSet = `set ${Field} ${string} ${string}`
/**
 * add {field} {key} {value}
 *
 * Add the given value to the given field.
 *
 * @examples ["add headers Content-Type application/json"]
 */
type RuleDoAdd = `add ${Field} ${string} ${string}`
/**
 * remove {field} {key}
 *
 * Remove the given key from the given field.
 *
 * @examples ["remove headers Content-Type"]
 */
type RuleDoRemove = `remove ${Field} ${string}`
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
type Field = 'headers' | 'query' | 'cookies'

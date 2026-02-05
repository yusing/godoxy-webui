export function middlewareUseToSnakeCase(use: string) {
  if (!use) return ''
  if (use in middlewareSnakeCaseMap) {
    return middlewareSnakeCaseMap[use as keyof typeof middlewareSnakeCaseMap]
  }
  return use
}

const middlewareSnakeCaseMap = {
  customErrorPage: 'error_page',
  CustomErrorPage: 'error_page',
  errorPage: 'error_page',
  ErrorPage: 'error_page',
  redirectHTTP: 'redirect_http',
  RedirectHTTP: 'redirect_http',
  setXForwarded: 'set_x_forwarded',
  SetXForwarded: 'set_x_forwarded',
  hideXForwarded: 'hide_x_forwarded',
  HideXForwarded: 'hide_x_forwarded',
  cidrWhitelist: 'cidr_whitelist',
  CIDRWhitelist: 'cidr_whitelist',
  cloudflareRealIP: 'cloudflare_real_ip',
  CloudflareRealIP: 'cloudflare_real_ip',
  realIP: 'real_ip',
  RealIP: 'real_ip',
  request: 'request',
  Request: 'request',
  modifyRequest: 'request',
  ModifyRequest: 'request',
  response: 'response',
  Response: 'response',
  modifyResponse: 'response',
  ModifyResponse: 'response',
  oidc: 'oidc',
  OIDC: 'oidc',
  rateLimit: 'rate_limit',
  RateLimit: 'rate_limit',
  hcaptcha: 'h_captcha',
  hCaptcha: 'h_captcha',
  modifyHTML: 'modify_html',
  ModifyHTML: 'modify_html',
} as const

import type { MockRequest, MockResponse } from '@/lib/api'

export interface PlaygroundExample {
  name: string
  description: string
  rules: string
  mockRequest: MockRequest
  mockResponse?: MockResponse
}

export const examples: PlaygroundExample[] = [
  {
    name: 'Simple Path Rewrite',
    description: 'Rewrites /api/* paths to /v1/*',
    rules: `- name: rewrite api
  on: path glob(/api/*)
  do: rewrite /api/ /v1/`,
    mockRequest: {
      method: 'GET',
      path: '/api/users',
      host: 'localhost',
      headers: {},
      query: {},
      cookies: [],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
  {
    name: 'Block Specific Method',
    description: 'Blocks POST requests with 405 error',
    rules: `- name: block POST
  on: method POST
  do: error "405" "Method Not Allowed"`,
    mockRequest: {
      method: 'POST',
      path: '/api/data',
      host: 'localhost',
      headers: {},
      query: {},
      cookies: [],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
  {
    name: 'Header-Based Routing',
    description: 'Requires Authorization header or returns 401',
    rules: `- name: check auth
  on: header Authorization
  do: pass
- name: require auth
  do: error "401" "Unauthorized"`,
    mockRequest: {
      method: 'GET',
      path: '/protected',
      host: 'localhost',
      headers: {
        Authorization: ['Bearer token'],
      },
      query: {},
      cookies: [],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
  {
    name: 'Testing Invalid Rules',
    description: 'Example of invalid rule syntax',
    rules: `- name: bad rule
  on: invalid_checker something
  do: pass`,
    mockRequest: {
      method: 'GET',
      path: '/',
      host: 'localhost',
      headers: {},
      query: {},
      cookies: [],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
  {
    name: 'CORS Preflight',
    description: 'Handles OPTIONS preflight and sets CORS headers',
    rules: `- name: cors preflight
  on: |
    method OPTIONS
    header Origin
    header Access-Control-Request-Method
  do: |
    set header Access-Control-Allow-Origin $header(Origin)
    set header Access-Control-Allow-Methods GET,POST,PUT,PATCH,DELETE,OPTIONS
    set header Access-Control-Allow-Headers $header(Access-Control-Request-Headers)
    set header Access-Control-Allow-Credentials true
    error "204" ""
- name: cors simple
  on: header Origin
  do: |
    set header Access-Control-Allow-Origin $header(Origin)
    set header Access-Control-Allow-Credentials true
    pass`,
    mockRequest: {
      method: 'OPTIONS',
      path: '/api/users',
      host: 'localhost',
      headers: {
        Origin: ['https://example.com'],
        'Access-Control-Request-Method': ['GET'],
        'Access-Control-Request-Headers': ['Content-Type'],
      },
      query: {},
      cookies: [],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
  {
    name: 'A/B Routing via Cookie',
    description: 'Routes to backend-b if exp_group=B cookie is present',
    rules: `- name: experiment group B
  on: cookie exp_group B
  do: proxy http://backend-b:8080
- name: experiment default (group A)
  do: proxy http://backend-a:8080`,
    mockRequest: {
      method: 'GET',
      path: '/feature',
      host: 'localhost',
      headers: {
        Cookie: ['exp_group=B'],
      },
      query: {},
      cookies: [],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
  {
    name: 'Maintenance Mode',
    description: 'Returns 503 for /api/** paths',
    rules: `- name: maintenance api
  on: path glob(/api/**)
  do: error "503" "Service under maintenance"
- name: default
  do: pass`,
    mockRequest: {
      method: 'GET',
      path: '/api/data',
      host: 'localhost',
      headers: {},
      query: {},
      cookies: [],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
  {
    name: 'Request Mutations',
    description: 'Mutates headers, query and cookies before proxy',
    rules: `- name: request mutations
  on: path glob(/api/**)
  do: |
    set header X-Request-Id $header(X-Request-Id)
    add header X-Forwarded-For $remote_host
    remove header X-Secret
    add query debug true
    set cookie locale en-US
    proxy http://api-server:8080`,
    mockRequest: {
      method: 'GET',
      path: '/api/items',
      host: 'localhost',
      headers: {
        'X-Request-Id': ['req-123'],
      },
      query: {},
      cookies: [],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
  {
    name: 'Log then Proxy',
    description: 'Logs status and content-type after upstream response',
    rules: `- name: log and proxy json responses
  on: path glob(/api/**)
  do: |
    log info /dev/stdout "Status=$status_code CT=$resp_header(Content-Type)"
    proxy http://api-server:8080`,
    mockRequest: {
      method: 'GET',
      path: '/api/ping',
      host: 'localhost',
      headers: {},
      query: {},
      cookies: [],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
  {
    name: 'Env-based Upstream',
    description: 'Uses ${SERVICE_HOST}:${SERVICE_PORT} for proxy target',
    rules: `- name: route by env-configured upstream
  on: path glob(/service/**)
  do: proxy https://\${SERVICE_HOST}:\${SERVICE_PORT}`,
    mockRequest: {
      method: 'GET',
      path: '/service/health',
      host: 'localhost',
      headers: {},
      query: {},
      cookies: [],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
  {
    name: 'WebSocket Upgrade',
    description: 'Passes upgrade requests through to upstream',
    rules: `- name: websocket upgrade
  on: |
    header Connection Upgrade
    header Upgrade websocket
  do: pass
- name: default
  do: proxy http://ws-backend:8080`,
    mockRequest: {
      method: 'GET',
      path: '/socket',
      host: 'localhost',
      headers: {
        Connection: ['Upgrade'],
        Upgrade: ['websocket'],
      },
      query: {},
      cookies: [],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
]

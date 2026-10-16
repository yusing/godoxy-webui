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
    rules: `path glob("/api/*") {
  rewrite /api/ /v1/
}`,
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
    rules: `method POST {
  error 405 "Method Not Allowed"
}`,
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
    description: 'Checks only that Authorization is present; it does not validate credentials.',
    rules: `header Authorization {
  pass
}

default {
  error 401 "Unauthorized"
}`,
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
    rules: `invalid_checker something {
  pass
}`,
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
    description:
      'Allows credentialed CORS from https://example.com. Replace it with your trusted origin.',
    rules: `method OPTIONS &
header Origin https://example.com &
header Access-Control-Request-Method {
  set resp_header Access-Control-Allow-Origin $header(Origin)
  set resp_header Access-Control-Allow-Methods GET,POST,PUT,PATCH,DELETE,OPTIONS
  set resp_header Access-Control-Allow-Headers $header(Access-Control-Request-Headers)
  set resp_header Access-Control-Allow-Credentials true
  add resp_header Vary Origin
}

method OPTIONS &
header Origin https://example.com &
header Access-Control-Request-Method {
  error 204 ""
}

header Origin https://example.com {
  set resp_header Access-Control-Allow-Origin $header(Origin)
  set resp_header Access-Control-Allow-Credentials true
  add resp_header Vary Origin
}`,
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
    description:
      'Makes a real request to backend-b for exp_group=B, otherwise backend-a. Replace both targets with reachable backends.',
    rules: `cookie exp_group B {
  proxy http://backend-b:8080
}

default {
  proxy http://backend-a:8080
}`,
    mockRequest: {
      method: 'GET',
      path: '/feature',
      host: 'localhost',
      headers: {},
      query: {},
      cookies: [{ name: 'exp_group', value: 'B' }],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
  {
    name: 'Maintenance Mode',
    description: 'Returns 503 for /api/** paths',
    rules: `path glob("/api/**") {
  error 503 "Service under maintenance"
}

default {
  pass
}`,
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
    description:
      'Mutates headers, query and cookies, then contacts api-server:8080. Replace the target with a reachable backend.',
    rules: `path glob("/api/**") {
  set header X-Request-Id $header(X-Request-Id)
  add header X-Forwarded-For $remote_host
  remove header X-Secret
  add query debug true
  set cookie locale en-US
  proxy http://api-server:8080
}`,
    mockRequest: {
      method: 'GET',
      path: '/api/items',
      host: 'localhost',
      headers: {
        'X-Request-Id': ['req-123'],
        'X-Secret': ['remove-me'],
      },
      query: {},
      cookies: [],
      body: '',
      remoteIP: '127.0.0.1',
    },
  },
  {
    name: 'Log then Proxy',
    description:
      'Logs the real backend response to the GoDoxy server console. Replace api-server:8080 with a reachable backend.',
    rules: `path glob("/api/**") {
  log info /dev/stdout "Status=$status_code CT=$resp_header(Content-Type)"
}

path glob("/api/**") {
  proxy http://api-server:8080
}`,
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
    description:
      'Requires SERVICE_HOST and SERVICE_PORT in the GoDoxy server environment and makes a real HTTPS request to that target.',
    rules: `path glob("/service/**") {
  proxy https://\${SERVICE_HOST}:\${SERVICE_PORT}
}`,
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
    description:
      'Matches WebSocket upgrade headers and calls the mock upstream; it does not simulate a WebSocket handshake.',
    rules: `header Connection Upgrade &
header Upgrade websocket {
  pass
}

default {
  error 400 "Expected WebSocket upgrade"
}`,
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

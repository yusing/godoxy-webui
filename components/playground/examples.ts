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
]

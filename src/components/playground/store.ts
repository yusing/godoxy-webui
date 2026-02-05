import { createStore } from 'juststore'
import type { MockRequest, MockResponse, PlaygroundResponse } from '@/lib/api'

export interface PlaygroundState {
  rules: string
  mockRequest: MockRequest
  mockResponse: MockResponse
  playgroundResponse: PlaygroundResponse | null
}

const defaultMockRequest: MockRequest = {
  method: 'GET',
  path: '/',
  host: 'localhost',
  headers: {},
  query: {},
  cookies: [],
  body: '',
  remoteIP: '127.0.0.1',
}

const defaultMockResponse: MockResponse = {
  statusCode: 200,
  headers: {},
  body: '',
}

const defaultState: PlaygroundState = {
  rules: '',
  mockRequest: defaultMockRequest,
  mockResponse: defaultMockResponse,
  playgroundResponse: null,
}

export const store = createStore('playground', defaultState)

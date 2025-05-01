import { toaster } from "@/components/ui/toaster";
import Endpoints, {
  ConfigFileType,
  fetchEndpoint,
  toastError,
} from "@/types/api/endpoints";
import { ConfigFile } from "@/types/file";

export async function updateRemote(
  current: ConfigFile,
  content: string,
  toast?: boolean,
) {
  await fetchEndpoint(Endpoints.fileContent(current.type, current.filename), {
    method: "PUT",
    body: content,
    headers: {
      "Content-Type": "application/yaml",
    },
  })
    .then(
      () =>
        toast &&
        toaster.create({
          title: "File saved",
          description: current.filename,
        }),
    )
    .catch(toastError);
}

export function templateByType(type: ConfigFileType) {
  switch (type) {
    case "provider":
      return routeFileTemplate;
    case "middleware":
      return middlewareFileTemplate;
    default:
      return "";
  }
}

const routeFileTemplate = `example: # matching "example.domain.com"
  scheme: http
  host: 10.0.0.254
  port: 80
  healthcheck:
    disabled: false
    path: /health
    interval: 5s
  load_balance:
    link: app
    mode: ip_hash
    options:
      header: X-Forwarded-For
  middlewares:
    cidr_whitelist:
      allow:
        - 127.0.0.1
        - 10.0.0.0/8
      status_code: 403
      message: IP not allowed
    hideXForwarded:
  homepage:
    name: Example App
    icon: "@selfhst/example.png"
    description: An example app
    category: example
  rules:
    - name: default
      do: pass
    - name: api
      on: path /api/*
      do: proxy http://10.0.0.2:8080
    - name: websocket
      on: path /ws/*
      do: proxy http://10.0.0.3:8080
  access_log:
    buffer_size: 8192
    path: /var/log/example.log
    filters:
      status_codes:
        values:
          - 200-299
          - 101
      method:
        values:
          - GET
      host:
        values:
          - example.y.z
      headers:
        negative: true
        values:
          - foo=bar
          - baz
      cidr:
        values:
          - 192.168.10.0/24
    fields:
      headers:
        default: keep
        config:
          foo: redact
      query:
        default: drop
        config:
          foo: keep
      cookies:
        default: redact
        config:
          foo: keep
`;

const middlewareFileTemplate = `middleware1:
  - use: CloudflareRealIP
  - use: CIDRWhitelist
    allow:
      - 127.0.0.1
      - 10.0.0.0/8
    message: You have been blocked
`;

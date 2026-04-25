FROM oven/bun:1.3.13-slim AS base

HEALTHCHECK NONE

FROM base AS utils-deps
WORKDIR /src
ENV DEBIAN_FRONTEND=noninteractive
# nodejs: real /usr/bin/node for Vite prerender (Bun’s `node` shim cannot fetch the preview server).
RUN apt update && apt install -y make nodejs && rm -rf /var/lib/apt/lists/*

# install stage for webui deps
FROM utils-deps AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
WORKDIR /temp/dev
RUN bun install --frozen-lockfile

# schema-gen stage for generating schema
FROM install AS schema-gen
COPY src/types/godoxy/ ./src/types/godoxy/
COPY Makefile ./Makefile
COPY tsconfig.json ./tsconfig.json
RUN make gen-schema

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM utils-deps AS prerelease
WORKDIR /app
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
COPY --from=schema-gen /temp/dev/src/types/godoxy/*.json ./src/types/godoxy/

ENV NODE_ENV=production
RUN /usr/bin/node ./node_modules/vite/bin/vite.js build

# Production image, copy all the files and run nginx
FROM nginx:1-alpine

ENV NODE_ENV=production

COPY nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

WORKDIR /app

COPY --from=prerelease --chown=nginx:nginx /app/dist/client ./out

EXPOSE 80

LABEL "proxy.*.rule_file"="embed://webui.yml"

CMD ["nginx", "-g", "daemon off;"]

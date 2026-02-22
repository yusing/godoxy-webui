FROM oven/bun:1.3.9-alpine AS base

HEALTHCHECK NONE

FROM base AS utils-deps
WORKDIR /src
RUN apk add --no-cache make=4.4.1-r3

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
FROM base AS prerelease
WORKDIR /app
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
COPY --from=schema-gen /temp/dev/src/types/godoxy/*.json ./src/types/godoxy/

# for lite image, we want a fully static output
ENV NODE_ENV=production
RUN bun --bun vite build --config lite.vite.config.ts

# Production image, copy all the files and run nginx
FROM nginx:1-alpine

ENV NODE_ENV=production

COPY nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

WORKDIR /app

COPY --from=prerelease --chown=nginx:nginx /app/.output/public ./out
COPY --from=prerelease --chown=nginx:nginx /app/.output/dist/client/__tsr ./out/__tsr

EXPOSE 80

LABEL "proxy.*.rule_file"="embed://webui.yml"

CMD ["nginx", "-g", "daemon off;"]

FROM oven/bun:1.3.9-alpine AS base

HEALTHCHECK NONE

FROM base AS utils-deps
WORKDIR /src

# git is for building wiki (vitepress deps)
RUN apk add --no-cache git=2.49.1-r0 make=4.4.1-r3

# wiki stage for vitepress deps
FROM utils-deps AS wiki-deps

COPY wiki/package.json wiki/bun.lock ./
RUN bun i -D --frozen-lockfile

# install stage for webui deps
FROM utils-deps AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY juststore/package.json juststore/bun.lock /temp/dev/juststore/
WORKDIR /temp/dev
RUN bun install --frozen-lockfile

# build wiki
FROM wiki-deps AS wiki-builder
WORKDIR /src
COPY wiki .
RUN sed -i "s|srcDir: 'src',|srcDir: 'src', base: '/wiki',|" .vitepress/config.mts
# redirect back to GoDoxy WebUI on the same tab when pressing "Home"
ENV NODE_ENV=production
RUN sed -i "s|link: '/'|link: '/../', rel: 'noopener noreferrer', target: '_self'|" .vitepress/config.mts && \
    bun --bun run docs:build

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
RUN ln -s /app/src/components/ui /app/juststore-shadcn/src/components/ui
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
COPY --from=wiki-builder --chown=nginx:nginx /src/.vitepress/dist ./out/wiki

EXPOSE 80

LABEL "proxy.*.rule_file"="embed://webui.yml"

CMD ["nginx", "-g", "daemon off;"]

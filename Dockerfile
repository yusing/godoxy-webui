FROM oven/bun:1.3.8-alpine AS base

HEALTHCHECK NONE

# utils stage for git and make
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
COPY juststore-shadcn/package.json juststore-shadcn/bun.lock /temp/dev/juststore-shadcn/
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
COPY --from=schema-gen /temp/dev/src/types/godoxy/*.json ./src/types/godoxy/

ENV NODE_ENV=production
RUN bun --bun vite build

# Production image, copy all the files and run bun
FROM oven/bun:1.3.8-distroless AS release
ENV NODE_ENV=production

USER 1001:1001

WORKDIR /app

COPY --from=prerelease --chown=1001:1001 /app/.output ./
COPY --from=wiki-builder /src/.vitepress/dist ./public/wiki

EXPOSE 3000

ENV PORT=3000

LABEL "proxy.*.rule_file"="embed://webui.yml"

CMD ["--bun", "server/index.mjs"]
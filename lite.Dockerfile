FROM oven/bun:1.3.8-alpine AS base

HEALTHCHECK NONE

FROM base AS utils-deps
WORKDIR /src

# git is for building wiki (vitepress deps)
RUN apk add --no-cache git=2.49.1-r0 make=4.4.1-r3

# Install dependencies based on the preferred package manager
COPY wiki/package.json wiki/bun.lock ./
RUN bun i -D --frozen-lockfile

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY juststore/package.json juststore/bun.lock /temp/dev/juststore/
WORKDIR /temp/dev
RUN bun install --frozen-lockfile

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM utils-deps AS prerelease
WORKDIR /app
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# for lite image, we need to export the build
RUN cp lite-next.config.ts next.config.ts && \
    make gen-schema && bun --bun run build

# Rebuild the source code only when needed
FROM utils-deps AS wiki-builder
WORKDIR /src
COPY wiki .
RUN sed -i "s|srcDir: 'src',|srcDir: 'src', base: '/wiki',|" .vitepress/config.mts
# redirect back to GoDoxy WebUI on the same tab when pressing "Home"
RUN sed -i "s|link: '/'|link: '/../', rel: 'noopener noreferrer', target: '_self'|" .vitepress/config.mts && \
    bun --bun run docs:build

# Production image, copy all the files and run nginx
FROM nginx:1-alpine

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

WORKDIR /app

COPY --from=prerelease --chown=nginx:nginx /app/out ./out
COPY --from=wiki-builder --chown=nginx:nginx /src/.vitepress/dist ./out/wiki

EXPOSE 80

ENV NODE_ENV=production

LABEL "proxy.*.rule_file"="embed://webui.yml"

CMD ["nginx", "-g", "daemon off;"]

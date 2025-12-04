FROM oven/bun:1.3.3-alpine AS base

HEALTHCHECK NONE

FROM base AS wiki-deps
WORKDIR /src

# git is for building wiki (vitepress deps)
RUN apk add --no-cache git=2.49.1-r0

# Install dependencies based on the preferred package manager
COPY wiki/package.json wiki/bun.lock ./
RUN bun i -D --frozen-lockfile

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
WORKDIR /temp/dev
RUN bun install --frozen-lockfile

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
WORKDIR /app
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN bun --bun run build

# Rebuild the source code only when needed
FROM wiki-deps AS wiki-builder
WORKDIR /src
COPY wiki .
RUN sed -i 's|srcDir: "src",|srcDir: "src", base: "/wiki",|' .vitepress/config.mts
# redirect back to GoDoxy WebUI on the same tab when pressing "Home"
RUN sed -i 's|link: "/"|link: "/../", rel: "noopener noreferrer", target: "_self"|' .vitepress/config.mts && \
    bun --bun run docs:build

# Production image, copy all the files and run next
FROM base AS release

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

USER 1001:1001

WORKDIR /app

COPY --from=prerelease --chown=1001:1001 /app/.next/standalone ./
COPY --from=prerelease --chown=1001:1001 /app/.next/static ./.next/static
COPY --from=prerelease --chown=1001:1001 /app/public ./public
COPY --from=wiki-builder --chown=1001:1001 /src/.vitepress/dist ./public/wiki

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

LABEL "proxy.#1.rule_file"="embed://webui.yml"

CMD ["server.js"]

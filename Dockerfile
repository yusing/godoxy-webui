FROM node:lts-alpine AS node
FROM oven/bun:1-alpine AS bun

FROM node AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

HEALTHCHECK NONE

FROM bun AS wiki-deps
WORKDIR /app

# git is for building wiki (vitepress deps)
RUN apk add --no-cache git

# Install dependencies based on the preferred package manager
COPY public/wiki/package.json public/wiki/bun.lock ./
RUN bun i --frozen-lockfile --ignore-scripts

# Install dependencies only when needed
FROM base AS webui-deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && \
    pnpm i --frozen-lockfile --ignore-scripts

# Rebuild the source code only when needed
FROM webui-deps AS webui-builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Rebuild the source code only when needed
FROM wiki-deps AS wiki-builder
WORKDIR /src
COPY public/wiki .
RUN sed -i 's|srcDir: "src",|srcDir: "src", base: "/wiki",|' .vitepress/config.mts
# redirect back to GoDoxy WebUI on the same tab when pressing "Home"
RUN sed -i 's|link: "/"|link: "/../", rel: "noopener noreferrer", target: "_self"|' .vitepress/config.mts
RUN bun run docs:build

# Production image, copy all the files and run next
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=webui-builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=webui-builder /app/.next/standalone ./
COPY --from=webui-builder /app/.next/static ./.next/static

COPY --from=wiki-builder /src/.vitepress/dist ./public/wiki

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="127.0.0.1"

USER 1001:1001

CMD ["server.js"]

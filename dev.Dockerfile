FROM node:lts-alpine

HEALTHCHECK NONE

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat && corepack enable pnpm

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

USER 1000:1000

WORKDIR /app

CMD ["pnpm", "run", "dev_docker"]

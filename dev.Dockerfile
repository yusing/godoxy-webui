FROM node:lts-alpine

HEALTHCHECK NONE

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY next.config.js tailwind.config.js postcss.config.js tsconfig.json .eslintrc.json ./

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

EXPOSE 3000

CMD ["pnpm", "run", "dev", "-H", "0.0.0.0", "-p", "3000"]

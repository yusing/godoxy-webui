FROM oven/bun:1.3.6-alpine AS base

HEALTHCHECK NONE

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

USER 1000:1000

WORKDIR /app

EXPOSE 3000

CMD ["bun", "--bun", "run", "dev"]

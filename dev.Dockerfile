FROM oven/bun:1.3.8-alpine AS base

HEALTHCHECK NONE

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

WORKDIR /app

EXPOSE 3000

LABEL "proxy.#1.rule_file"="embed://webui.yml"

CMD ["bun", "--bun", "next", "dev"]

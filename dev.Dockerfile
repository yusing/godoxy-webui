FROM oven/bun:1.3.5-alpine AS base

HEALTHCHECK NONE

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

USER 1000:1000

WORKDIR /app

EXPOSE 3000

LABEL "proxy.#1.rule_file"="embed://webui.yml"

CMD ["bun", "--bun", "run", "dev"]

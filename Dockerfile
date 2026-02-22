FROM oven/bun:1.3.9-alpine AS base

HEALTHCHECK NONE

FROM base AS utils-deps
WORKDIR /src
RUN apk add --no-cache make=4.4.1-r3

# install stage for webui deps
FROM utils-deps AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
WORKDIR /temp/dev
RUN bun install --frozen-lockfile

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
# staticFunctionMiddleware causes issues with non-static builds
RUN sed -i 's/\.middleware(\[staticFunctionMiddleware\])//g' src/routes/docs/\$.tsx
COPY --from=schema-gen /temp/dev/src/types/godoxy/*.json ./src/types/godoxy/

ENV NODE_ENV=production
RUN bun --bun vite build

# Production image, copy all the files and run bun
FROM oven/bun:1.3.9-distroless AS release
ENV NODE_ENV=production

USER 1001:1001

WORKDIR /app

COPY --from=prerelease --chown=1001:1001 /app/.output ./

EXPOSE 3000

ENV PORT=3000

LABEL "proxy.*.rule_file"="embed://webui.yml"

CMD ["--bun", "server/index.mjs"]
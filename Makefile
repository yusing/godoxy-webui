VERSION ?= $(shell git describe --tags --abbrev=0)
BUILD_DATE ?= $(shell date -u +'%Y%m%d-%H%M%S')
PWD := $(shell pwd)
SRC_DIR := src
SCHEMA_DIR := ${SRC_DIR}/types/godoxy

.PHONY: dev

export PWD
export BUILDKIT_PROGRESS=plain

dev:
	docker compose up --build --pull=never

dev-lite:
	DOCKERFILE=lite.dev.Dockerfile docker compose up --build --pull=never

commit-push:
	bun format:write
	git add .
	git commit
	git push

update-wiki:
	cd public/wiki && git pull

# emulates docker build process for wiki using git worktree (submodule)
build-wiki:
	[ -d ${PWD}/public/wiki ] && rm -r ${PWD}/public/wiki || true
	git -C wiki worktree add /tmp/wiki-$(BUILD_DATE) HEAD
	@trap 'cd ${PWD} && git -C wiki worktree remove /tmp/wiki-$(BUILD_DATE) --force' EXIT; \
	cd /tmp/wiki-$(BUILD_DATE) && \
	bun i -D --frozen-lockfile && \
	sed -i "s|srcDir: 'src',|srcDir: 'src', base: '/wiki',|" .vitepress/config.mts && \
	sed -i "s|link: '/'|link: '/../', rel: 'noopener noreferrer', target: '_self'|" .vitepress/config.mts && \
	head -n 10 .vitepress/config.mts && \
	bun --bun run docs:build && \
	cp -r .vitepress/dist ${PWD}/public/wiki

test-run:
	docker compose -f test-run.compose.yml up --build --pull=never

test-run-lite:
	docker compose -f test-run.lite.compose.yml up --build --pull=never

gen-schema-single:
	bunx --bun ts-json-schema-generator --minify --no-type-check -e export --no-ref-encode -f ./tsconfig.json -o "${SCHEMA_DIR}/${OUT}" -p "${SCHEMA_DIR}/${IN}" -t ${CLASS}
	# deference
	bun --bun ${SCHEMA_DIR}/deref.ts ${SCHEMA_DIR}/${OUT}

gen-schema:
	make IN=config/config.ts \
			CLASS=Config \
			OUT=config.schema.json \
			gen-schema-single
	make IN=config/autocert.ts \
			CLASS=AutocertConfigWithoutExtra \
			OUT=autocert.schema.json \
			gen-schema-single
	make IN=providers/routes.ts \
			CLASS=Routes \
			OUT=routes.schema.json \
			gen-schema-single
	make IN=middlewares/middleware_compose.ts \
			CLASS=MiddlewareCompose \
			OUT=middleware_compose.schema.json \
			gen-schema-single
	make IN=docker.ts \
			CLASS=DockerRoutes \
			OUT=docker_routes.schema.json \
			gen-schema-single
	make IN=config/acl.ts \
			CLASS=ACLConfig \
			OUT=acl.schema.json \
			gen-schema-single
	make IN=config/maxmind.ts \
			CLASS=MaxmindConfig \
			OUT=maxmind.schema.json \
			gen-schema-single

gen-docker-compose-types:
	[ -f ${SCHEMA_DIR}/types/compose-spec.json ] || curl -o ${SCHEMA_DIR}/types/compose-spec.json https://raw.githubusercontent.com/compose-spec/compose-spec/main/schema/compose-spec.json
	[ -f ${SCHEMA_DIR}/types/compose-spec.ts ] || bunx json-schema-to-typescript ${SCHEMA_DIR}/types/compose-spec.json ${SCHEMA_DIR}/types/compose-spec.ts
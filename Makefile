VERSION ?= $(shell git describe --tags --abbrev=0)
BUILD_DATE ?= $(shell date -u +'%Y%m%d-%H%M')

SCHEMA_DIR := types/godoxy

.PHONY: dev

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

test-run:
	docker compose -f test-run.compose.yml up --build --pull=never

test-run-lite:
	docker compose -f test-run.lite.compose.yml up --build --pull=never

gen-schema-single:
	bun --bun ts-json-schema-generator --minify --no-type-check -e export --no-ref-encode -f ./tsconfig.json -o "${SCHEMA_DIR}/${OUT}" -p "${SCHEMA_DIR}/${IN}" -t ${CLASS}
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
	[ -f types/compose-spec.json ] || curl -o types/compose-spec.json https://raw.githubusercontent.com/compose-spec/compose-spec/main/schema/compose-spec.json
	[ -f types/compose-spec.ts ] || bunx json-schema-to-typescript types/compose-spec.json types/compose-spec.ts
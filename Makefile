VERSION ?= $(shell git describe --tags --abbrev=0)
BUILD_DATE ?= $(shell date -u +'%Y%m%d-%H%M')

SCHEMA_DIR := src/types/godoxy

.PHONY: dev

dev:
	docker compose up --build

commit-push:
	pnpm format:write
	git add .
	git commit
	git push

update-wiki:
	cd public/wiki && git pull

test-run:
	docker compose -f test-run.compose.yml up --build

gen-schema-single:
	pnpm typescript-json-schema --noExtraProps --required --skipLibCheck --tsNodeRegister=true -o "${SCHEMA_DIR}/${OUT}" "${SCHEMA_DIR}/${IN}" ${CLASS}
	# minify
	python3 -c "import json; f=open('${SCHEMA_DIR}/${OUT}', 'r'); j=json.load(f); f.close(); f=open('${SCHEMA_DIR}/${OUT}', 'w'); json.dump(j, f, separators=(',', ':'));"

gen-schema:
	make IN=config/config.ts \
			CLASS=Config \
			OUT=config.schema.json \
			gen-schema-single
	make IN=providers/routes.ts \
			CLASS=Routes \
			OUT=routes.schema.json \
			gen-schema-single
	make IN=middlewares/middleware_compose.ts \
			CLASS=MiddlewareCompose \
			OUT=middleware_compose.schema.json \
			gen-schema-single
	make IN=middlewares/middleware_compose.ts \
			CLASS=EntrypointMiddlewares \
			OUT=entrypoint_middlewares.schema.json \
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
	pnpm format:write
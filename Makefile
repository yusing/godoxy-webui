VERSION ?= $(shell git describe --tags --abbrev=0)
BUILD_DATE ?= $(shell date -u +'%Y%m%d-%H%M')

SCHEMA_DIR := src/types/godoxy

.PHONY: dev push-docker-io

dev:
	docker compose up --build

commit-push:
	pnpm format:write
	git add .
	git commit
	git push

push-docker-io:
	pnpm format:write
	BUILDER=build docker buildx build \
		--platform linux/arm64,linux/amd64 \
		-f Dockerfile \
		-t docker.io/yusing/godoxy-frontend-nightly \
		-t docker.io/yusing/godoxy-frontend-nightly:${VERSION}-${BUILD_DATE} \
		--build-arg VERSION="${VERSION}-nightly-${BUILD_DATE}" \
		--push .

update-wiki-sidebar:
	python scripts/wiki_sidebar.py

update-wiki:
	git submodule update --init public/wiki
	make update-wiki-sidebar

gen-schema-single:
	pnpm typescript-json-schema --noExtraProps --required --skipLibCheck --tsNodeRegister=true -o "${OUT}" "${IN}" ${CLASS}
	# minify
	python3 -c "import json; f=open('${OUT}', 'r'); j=json.load(f); f.close(); f=open('${OUT}', 'w'); json.dump(j, f, separators=(',', ':'));"

gen-schema:
	# pnpm tsc ${SCHEMA_DIR}/**/*.ts --noEmit
	make IN=${SCHEMA_DIR}/config/config.ts \
			CLASS=Config \
			OUT=${SCHEMA_DIR}/config.schema.json \
			gen-schema-single
	make IN=${SCHEMA_DIR}/providers/routes.ts \
			CLASS=Routes \
			OUT=${SCHEMA_DIR}/routes.schema.json \
			gen-schema-single
	make IN=${SCHEMA_DIR}/middlewares/middleware_compose.ts \
			CLASS=MiddlewareCompose \
			OUT=${SCHEMA_DIR}/middleware_compose.schema.json \
			gen-schema-single
	make IN=${SCHEMA_DIR}/docker.ts \
			CLASS=DockerRoutes \
			OUT=${SCHEMA_DIR}/docker_routes.schema.json \
			gen-schema-single
	make IN=${SCHEMA_DIR}/config/acl.ts \
			CLASS=ACLConfig \
			OUT=${SCHEMA_DIR}/acl.schema.json \
			gen-schema-single
	pnpm format:write
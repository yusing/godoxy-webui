VERSION ?= $(shell git describe --tags --abbrev=0)
BUILD_DATE ?= $(shell date -u +'%Y%m%d-%H%M')

.PHONY: build dev

dev:
	docker compose up --build

push-docker-io:
	pnpm format:write
	BUILDER=build docker buildx build \
		--platform linux/arm64,linux/amd64 \
		-f Dockerfile \
		-t docker.io/yusing/godoxy-frontend-nightly \
		-t docker.io/yusing/godoxy-frontend-nightly:${VERSION}-${BUILD_DATE} \
		--build-arg VERSION="${VERSION}-nightly-${BUILD_DATE}" \
		--push .
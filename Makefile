.PHONY: build-docker build dev

build-docker:
	docker build . -t ghcr.io/yusing/go-proxy-frontend:latest

build:
	bun run build

dev:
	bun run dev

push-docker-io:
	docker context create builder-context
	docker buildx create --name builderx --driver docker-container --use builder-context
	docker buildx build --platform linux/amd64,linux/arm64 -t docker.io/yusing/godoxy-frontend-nightly --push .
.PHONY: build-docker build dev

build-docker:
	docker build . -t ghcr.io/yusing/go-proxy-frontend:latest

build:
	bun run build

dev:
	bun run dev

push-docker-io:
	BUILDER=build docker buildx build --platform linux/arm64,linux/amd64 -t docker.io/yusing/godoxy-frontend-nightly --push .
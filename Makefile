.PHONY: build-docker build dev

dev:
	docker compose up -d --build

push-docker-io:
	BUILDER=build docker buildx build --platform linux/arm64,linux/amd64 -t docker.io/yusing/godoxy-frontend-nightly --push .
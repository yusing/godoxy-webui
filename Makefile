.PHONY: build dev

dev:
	docker compose up --build

push-docker-io:
	BUILDER=build docker buildx build --platform linux/arm64,linux/amd64 -t docker.io/yusing/godoxy-frontend-nightly --push .

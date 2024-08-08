.PHONY: build-docker build dev

build-docker:
	docker build . -t ghcr.io/yusing/go-proxy-frontend:latest

build:
	bun run build

dev:
	bun run dev
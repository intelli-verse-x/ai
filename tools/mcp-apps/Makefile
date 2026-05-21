.PHONY: install typecheck build test docker-build

IMAGE ?= mcp-apps:local

install:
	npm ci

typecheck:
	npm run typecheck

build:
	npm run build

test:
	npm test

docker-build:
	docker build -t $(IMAGE) .

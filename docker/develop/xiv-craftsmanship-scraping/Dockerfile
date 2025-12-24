FROM node:25.2.1-slim AS builder

WORKDIR /app

COPY ./app/package.json ./
COPY ./app/package-lock.json ./

COPY ./app/tsconfig.json ./
COPY ./app/src ./src

RUN npm run build:ci


# NOTE: docker imageのバージョンを固定
#       バージョンが変わるとブラウザのバージョンも代わりexecutablePathもかわるので注意
FROM ghcr.io/puppeteer/puppeteer:24.33.0

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

CMD ["node"]

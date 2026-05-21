# syntax=docker/dockerfile:1

FROM node:24-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/number-intelligence/package.json apps/number-intelligence/package.json
COPY apps/usage-cost-explorer/package.json apps/usage-cost-explorer/package.json
COPY apps/voice-monitor/package.json apps/voice-monitor/package.json
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY apps ./apps
RUN npm run build && npm prune --omit=dev

FROM node:24-slim AS runtime
ENV NODE_ENV=production \
    PORT=8080
WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER node
EXPOSE 8080
CMD ["node", "dist/src/index.js"]

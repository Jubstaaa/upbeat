# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000
COPY package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile --production
COPY src ./src
COPY --from=build /app/dist/client ./dist/client
USER bun
EXPOSE 3000
CMD ["bun", "src/server/bun.ts"]

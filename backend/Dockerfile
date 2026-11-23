FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable pnpm

COPY backend/package.json backend/pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY backend/ .
COPY proto/ ./src/proto/

RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable pnpm

COPY backend/package.json backend/pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY proto/ ./dist/proto/

EXPOSE 5050

CMD ["node", "dist/src/main"]

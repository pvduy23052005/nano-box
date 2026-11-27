FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable pnpm

COPY services/realtime-gateway/package.json services/realtime-gateway/pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-realtime-gateway,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY services/realtime-gateway/ .

RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable pnpm

COPY services/realtime-gateway/package.json services/realtime-gateway/pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-realtime-gateway,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 5053

CMD ["node", "dist/main"]

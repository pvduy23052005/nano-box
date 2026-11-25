FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable pnpm

COPY services/notification/package.json services/notification/pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-notification,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY services/notification/ .
COPY proto/ ./src/proto/

RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable pnpm

COPY services/notification/package.json services/notification/pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-notification,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 5052
EXPOSE 50053

CMD ["node", "dist/main"]

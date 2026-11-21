FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable pnpm

COPY services/upload/package.json services/upload/pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-upload,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY services/upload/ .
COPY proto/ ./src/proto/

RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable pnpm

COPY services/upload/package.json services/upload/pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-upload,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 5051
EXPOSE 50052

CMD ["node", "dist/main"]

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/
COPY packages/api/prisma ./packages/api/prisma
COPY packages/shared/package.json ./packages/shared/
RUN npm install -g pnpm && pnpm install --filter api --filter shared --frozen-lockfile
COPY packages/shared ./packages/shared
COPY packages/api ./packages/api
RUN pnpm --filter api build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/src/main"]

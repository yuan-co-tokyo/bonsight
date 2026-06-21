FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/web/package.json ./packages/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm install -g pnpm && pnpm install --filter web --filter shared --frozen-lockfile
COPY packages/shared ./packages/shared
COPY packages/web ./packages/web
ARG VITE_API_BASE_URL=http://localhost:3000/api/v1
RUN pnpm --filter web build

FROM nginx:alpine
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html
EXPOSE 80

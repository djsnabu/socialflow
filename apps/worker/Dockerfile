FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @socialflow/worker build
WORKDIR /app/apps/worker
CMD ["node", "dist/index.cjs"]

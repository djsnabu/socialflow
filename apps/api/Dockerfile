FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @socialflow/api build
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/index.cjs"]

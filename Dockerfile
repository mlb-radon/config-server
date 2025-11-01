FROM node:24.6-slim AS base

# Stage 1: Build frontend
FROM base AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN --mount=type=cache,target=/root/.npm npm install
COPY frontend .
COPY tsconfig.json ../tsconfig.json
RUN npm run build

# Stage 2: Build backend and serve frontend
FROM base AS backend-build
WORKDIR /app

# Copy backend and shared code
COPY package.json package-lock.json ./
COPY backend/package.json backend/nest-cli.json backend/tsconfig*.json ./backend/
RUN npm ci --workspaces --include-workspace-root

# Copy backend and shared source
COPY ./backend/src ./backend/src/
COPY ./shared/src/ ./backend/src/shared/

# Build backend (if needed)
WORKDIR /app/backend
RUN npm run build

# ---- build the release container ----
FROM base AS release

# Set environment variables (optional)
ENV NODE_ENV=production
ENV TZ=Europe/Brussels
RUN ln -sf /usr/share/zoneinfo/Europe/Brussels /etc/localtime

WORKDIR /app
COPY --from=backend-build /app/package.json /app/package-lock.json ./
COPY --from=backend-build /app/backend/package.json ./backend/
RUN --mount=type=cache,target=/root/.npm npm ci -w backend --omit=dev
COPY --from=backend-build /app/backend/dist ./
COPY --from=frontend-build /app/frontend/dist ./public


# Copy built frontend to backend public directory

EXPOSE 3000

CMD ["node","main.js"] 
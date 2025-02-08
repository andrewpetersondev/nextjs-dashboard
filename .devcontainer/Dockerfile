# syntax=docker.io/docker/dockerfile:1

# Builder stage shared across all targets
FROM node:23 as builder
WORKDIR /usr/src/workspace
EXPOSE 3000 9229
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev
COPY . .

# Development stage
FROM builder as dev
CMD ["npm", "run", "dev"]

# Production stage
FROM builder as prod
RUN npm ci --omit=dev
RUN npm run build
USER node
CMD ["npm", "run", "start"]

# Test stage
FROM builder as test
ENV NODE_ENV=test
RUN npm run test

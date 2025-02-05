# syntax=docker.io/docker/dockerfile:1

ARG NODE_VERSION=23

# Base stage
FROM node:${NODE_VERSION} as base
WORKDIR /usr/src/workspace
EXPOSE 3000
EXPOSE 9229
#RUN npm install -g npm@latest

# Development stage
FROM base as dev
COPY package*.json ./
RUN npm install
#RUN --mount=type=bind,source=package.json,target=package.json \
#    --mount=type=bind,source=package-lock.json,target=package-lock.json \
#    --mount=type=cache,target=/root/.npm \
#    npm ci --include=dev
COPY . .
CMD ["npm", "run", "dev"]

# Production stage
FROM base as prod
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
USER node
COPY . .
CMD npm run build && npm run start

# Test stage
FROM base as test
ENV NODE_ENV test
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev
USER node
COPY . .
RUN npm run test

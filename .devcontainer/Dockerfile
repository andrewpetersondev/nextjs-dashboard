# syntax=docker.io/docker/dockerfile:1

# Builder stage shared across all targets
FROM node:23 AS builder
WORKDIR /usr/src/workspace

# Copy files (temporary debug: copy everything in case of failure)
#COPY .. .
# List all files in the workspace directory
#RUN ls -la /usr/src/workspace

EXPOSE 3000 9229
COPY ../package*.json ./
# RUN npm install
COPY .. .

# Development stage
FROM builder AS dev
CMD ["npm", "run", "dev"]

# Production stage
FROM builder AS prod
RUN npm ci --omit=dev
RUN npm run build
USER node
CMD ["npm", "run", "start"]

# Test stage
#FROM builder AS test
#ENV NODE_ENV=test
#RUN npm run test

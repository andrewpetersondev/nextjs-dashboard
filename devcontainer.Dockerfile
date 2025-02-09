# syntax=docker.io/docker/dockerfile:1

# Builder stage shared across all targets
FROM node:23 AS builder
WORKDIR /usr/src/workspace
EXPOSE 3000 9229
COPY package*.json .
RUN npm install
COPY . .

# Development stage
FROM builder AS dev
CMD ["npm", "run", "dev"]



# syntax=docker.io/docker/dockerfile:1

# Use a lightweight Node.js image
FROM node:lts-alpine

# Set working directory inside the container
WORKDIR /project

# Enable Corepack to manage pnpm automatically
RUN corepack enable

# Copy the .npmrc file into the container to enforce pnpm as the package manager
COPY .npmrc .npmrc

# Copy only package manager files first to leverage Docker caching and optimize builds
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./

# Check for lock files and do corresponding package manager installation
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install; \
    elif [ -f yarn.lock ]; then \
      yarn install; \
    elif [ -f package-lock.json ]; then \
      npm install; \
    else \
      echo "Error: No lock file found (pnpm-lock.yaml, yarn.lock, or package-lock.json). Please use a supported package manager." >&2; \
      exit 1; \
    fi

# RUN pnpm install --frozen-lockfile

# Copy the remaining application files after dependencies
COPY . /project

# Set default command to start the development server
CMD if [ -f pnpm-lock.yaml ]; then \
      pnpm dev; \
    elif [ -f yarn.lock ]; then \
      yarn dev; \
    elif [ -f package-lock.json ]; then \
      npm run dev; \
    else \
      echo "Error: No lock file found (pnpm-lock.yaml, yarn.lock, or package-lock.json). Please use a supported package manager." >&2; \
      exit 1; \
    fi
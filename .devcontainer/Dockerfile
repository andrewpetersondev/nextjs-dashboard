# syntax=docker.io/docker/dockerfile:1

FROM node

WORKDIR /project/nextjs-dashboard

# Enable Corepack to manage pnpm automatically
RUN corepack enable

COPY ../package.json ../pnpm-lock.yaml* ../package-lock.json* ../yarn.lock* ./

# Check for lock files and do corresponding package manager installation
RUN if [ -f pnpm-lock.yaml ]; then \
  pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then \
  yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
  npm ci; \
  else \
  echo "Error: No lock file found. Please use a supported package manager." >&2; \
  exit 1; \
  fi


# Copy the remaining application files
COPY ../ .

# Set default command to start the development server
CMD ["sh", "-c", "if [ -f pnpm-lock.yaml ]; then pnpm dev; elif [ -f yarn.lock ]; then yarn dev; elif [ -f package-lock.json ]; then npm run dev; else echo 'Error: No lock file found. Please use a supported package manager.' >&2; exit 1; fi"]

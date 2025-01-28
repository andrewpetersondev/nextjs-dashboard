# FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm
FROM mcr.microsoft.com/devcontainers/javascript-node


# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    #  && apt-get -y install --no-install-recommends \
    #  curl zsh

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"

WORKDIR /workspaces/${localWorkspaceFolderBasename}

# Install dependencies
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
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
COPY . .

# Set default command to start the development server
CMD ["pnpm", "dev"]
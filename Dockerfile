# syntax=docker.io/docker/dockerfile:1

# Development stage
# ====================================================================

FROM node:23

WORKDIR /workspace

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000 9229

CMD ["npm", "run", "dev"]


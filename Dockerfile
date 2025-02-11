FROM node:23-alpine

WORKDIR /project

# Install Git
RUN apk update && apk add --no-cache git

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000 9229
CMD ["npm", "run", "dev"]

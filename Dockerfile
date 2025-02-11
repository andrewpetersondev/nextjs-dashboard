FROM node

WORKDIR /project

COPY package*.json ./
RUN npm install && npm install -g npm@11

COPY . .

EXPOSE 3000 9229
CMD ["npm", "run", "dev"]

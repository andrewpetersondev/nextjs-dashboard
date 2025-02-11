FROM node

WORKDIR /project

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000 9229
CMD ["npm", "run", "dev"]

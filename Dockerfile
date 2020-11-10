FROM node:12.19.0-alpine3.10

WORKDIR /app

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY . ./app

EXPOSE 3000

CMD [ "npm", "start" ]

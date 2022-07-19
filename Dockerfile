FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn && yarn rebuild

COPY . .

EXPOSE 3333

CMD [ "yarn", "start" ]
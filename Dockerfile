# FROM ubuntu:latest
FROM node:20.12.2

# create app directory
WORKDIR /usr/src/app

# install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
# COPY *

EXPOSE 8080
CMD [ "node", "index.js"]
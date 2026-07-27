FROM node:26
WORKDIR /usr/src/app
COPY package*.json /package.json
RUN npm install
COPY . .
CMD ["node", "index.js"]
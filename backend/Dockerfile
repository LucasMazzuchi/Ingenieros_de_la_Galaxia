FROM node:26
WORKDIR /usr/src/app
COPY package.json /package.json
RUN npm install
COPY . .
#Hay que incluir el copy de los demás archivos, como no existen, el copy tampoco.
#En index.js tiene que ir el js que se deba ejecutar al querer levantar el programa.
CMD ["node", "index.js"]
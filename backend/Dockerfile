FROM node:26
COPY package.json /package.json
RUN npm install
WORKDIR /usr/src/app
#Hay que incluir el copy de los demás archivos, como no existen, el copy tampoco.
#En index.js tiene que ir el js que se deba ejecutar al querer levantar el programa.
CMD ["node", "index.js"]
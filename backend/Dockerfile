FROM node:26
WORKDIR /backend
COPY package.json ./
RUN npm install
//Hay que incluir el copy de los demás archivos, como no existen, el copy tampoco.
CMD ["node", "index.js"] //En index.js tiene que ir el js que se deba ejecutar al querer levantar el programa.
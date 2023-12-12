FROM node:alpine
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
CMD ["env"]
COPY ./ ./
RUN npm i
CMD ["npm", "run", "start"]
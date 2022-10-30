#nextjs npm install dockerfile
FROM node:14.15.4-alpine3.12
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "dev"]


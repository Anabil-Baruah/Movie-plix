FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . ./

ENV NODE_ENV=production
ENV APP_PORT=5000
EXPOSE 5000

CMD ["npm", "run", "start"]
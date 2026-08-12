# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/

RUN npm ci \
  && npm ci --prefix client \
  && npm ci --prefix server

COPY . .

RUN npm run build --prefix client

ENV NODE_ENV=production
ENV PORT=5001
ENV DB_PATH=/data/indiapaynow.db
ENV CLIENT_URL=*

EXPOSE 5001

CMD ["sh", "-c", "node server/src/db/bootstrap.js && node server/src/index.js"]

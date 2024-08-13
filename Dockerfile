FROM node:20 as base

WORKDIR /home/node/app

COPY package*.json ./

RUN npm ci

COPY . .

FROM base as builder

RUN npm run build

FROM node:20-slim as production

WORKDIR /home/node/app

COPY --from=builder /home/node/app/package*.json ./
COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/migrations ./migrations

RUN npm ci --only=production && \
    npm cache clean --force

ENV NODE_PATH=./dist

CMD ["node", "dist/index.js"]

FROM base as migration

CMD ["npm", "run", "migrate"]
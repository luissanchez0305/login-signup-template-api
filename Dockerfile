FROM node:lts-alpine AS build

ENV NODE_ENV=development

WORKDIR /usr/src/app

COPY . .

RUN npm i

RUN npm run build

RUN npm prune --production


FROM node:lts-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist .
COPY --from=build /usr/src/app/node_modules ./node_modules

EXPOSE 3000
EXPOSE 9229

CMD [ "node", "main" ]
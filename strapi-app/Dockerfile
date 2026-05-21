FROM node:18-alpine

RUN apk add --no-cache bash git curl netcat-openbsd

WORKDIR /srv/app

COPY entrypoint.sh /srv/app/entrypoint.sh
RUN chmod +x /srv/app/entrypoint.sh

RUN npm cache clean --force

ENV NODE_ENV=development

EXPOSE 1337

CMD ["strapi", "develop", "--watch-admin"]
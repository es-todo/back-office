FROM ubuntu:24.04
RUN apt update -y
RUN apt upgrade -y
RUN apt install wget -y
RUN wget https://deb.nodesource.com/setup_24.x && bash setup_24.x
RUN apt install nodejs -y

RUN mkdir /app
RUN mkdir /app/packages
RUN mkdir /app/packages/spa
RUN mkdir /app/packages/ssr
WORKDIR /app
COPY ./package-lock.json               /app
COPY ./package.json                    /app
COPY ./packages/spa/package.json       /app/packages/spa
COPY ./packages/ssr/package.json       /app/packages/ssr
RUN npm ci

COPY ./packages/ssr/tsconfig.json      /app/packages/ssr
COPY ./packages/ssr/tsconfig.app.json  /app/packages/ssr
COPY ./packages/ssr/tsconfig.node.json /app/packages/ssr
COPY ./packages/ssr/src                /app/packages/ssr/src

COPY ./packages/spa/eslint.config.js   /app/packages/spa
COPY ./packages/spa/tsconfig.json      /app/packages/spa
COPY ./packages/spa/tsconfig.app.json  /app/packages/spa
COPY ./packages/spa/tsconfig.node.json /app/packages/spa
COPY ./packages/spa/vite.config.ts     /app/packages/spa
COPY ./packages/spa/index.html         /app/packages/spa
COPY ./packages/spa/public             /app/packages/spa/public
COPY ./packages/spa/src                /app/packages/spa/src

RUN npm run build
COPY docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]

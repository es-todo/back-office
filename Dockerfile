FROM ubuntu:24.04
RUN apt update -y
RUN apt upgrade -y
RUN apt install postgresql -y
RUN apt install wget -y
RUN apt install sudo -y
RUN apt install neovim -y
RUN wget https://deb.nodesource.com/setup_23.x
RUN sudo -E bash setup_23.x
RUN sudo apt-get install nodejs -y

RUN mkdir /app
RUN mkdir /app/packages
RUN mkdir /app/packages/spa
WORKDIR /app
COPY ./package-lock.json               /app
COPY ./package.json                    /app
COPY ./packages/spa/package.json       /app/packages/spa
RUN npm ci
COPY ./packages/spa/eslint.config.js   /app/packages/spa
COPY ./packages/spa/tsconfig.json      /app/packages/spa
COPY ./packages/spa/tsconfig.app.json  /app/packages/spa
COPY ./packages/spa/tsconfig.node.json /app/packages/spa
COPY ./packages/spa/vite.config.ts     /app/packages/spa
COPY ./packages/spa/index.html         /app/packages/spa
COPY ./packages/spa/public             /app/packages/spa/public
COPY ./packages/spa/src                /app/packages/spa/src

COPY docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]



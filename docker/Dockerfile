FROM node:12
WORKDIR /root/app
COPY ./dist ./dist
COPY ./package.json ./
COPY ./yarn.lock ./
RUN yarn install --prod
CMD ["npm", "run", "server"]
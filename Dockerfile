FROM node:16-alpine3.14
WORKDIR /app
COPY ./package.json /app
COPY ./package-lock.json /app

RUN npm config set unsafe-perm true
#RUN npm install && npm audit fix
RUN npm install
COPY ./deploy.sh /app
COPY ./ /app

ENV PORT=80

RUN apk add --no-cache tzdata

ENV TZ=Africa/Kampala
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone


EXPOSE 80
RUN ["chmod", "+x", "/app/deploy.sh"]
ENTRYPOINT ["/app/deploy.sh"]

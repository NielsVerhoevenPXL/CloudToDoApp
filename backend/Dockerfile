FROM node:16
WORKDIR /usr/src/app

COPY . .
RUN npm install

EXPOSE 8080

ENV PORT=8080
ENV DBURL=mysql
ENV DBUSER=root
ENV DBPASSWORD=password
ENV DBDATABASE=todo
ENV DBPORT=3306

CMD ["npm","start"]
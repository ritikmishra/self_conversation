FROM node:14-buster as builder

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . /app

RUN npm install
RUN npm run build


FROM nginx:1.19

COPY --from=builder /app/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
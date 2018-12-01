FROM golang:1.11-alpine as gobuilder
WORKDIR /tmp
COPY main.go .
RUN go build -o app main.go

FROM node:8.14 as nodebuilder
RUN mkdir -p /kae/app
ADD . /kae/app

WORKDIR /kae/app
RUN npm install --registry=https://registry.npm.taobao.org && \
    npm run build

FROM alpine:latest
RUN apk --no-cache add ca-certificates && \
    mkdir -p /kae/app

WORKDIR /kae/app

COPY --from=gobuilder /tmp/app .
COPY --from=nodebuilder /kae/app/dist ./dist

CMD ["./app"]

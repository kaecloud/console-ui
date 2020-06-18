FROM golang:1.11-alpine as gobuilder
WORKDIR /tmp
COPY main.go .
RUN go build -o app main.go

FROM node:10-alpine as nodebuilder
RUN mkdir -p /kae/app
ADD . /kae/app

WORKDIR /kae/app
RUN npm config set registry https://registry.npm.taobao.org/ && \
    npm install && \
    npm run build

FROM alpine:latest
RUN apk --no-cache add ca-certificates && \
    mkdir -p /kae/app

WORKDIR /kae/app

COPY --from=gobuilder /tmp/app .
COPY --from=nodebuilder /kae/app/build ./build

CMD ["./app"]

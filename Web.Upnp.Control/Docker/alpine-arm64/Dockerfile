FROM mcr.microsoft.com/dotnet/runtime-deps:5.0-alpine-arm64v8 AS base

RUN adduser -u 5678 --disabled-password --home /app --gecos "" upnp-dashboard

WORKDIR /app

COPY . .

RUN apk update && \
    apk add openssl bash sqlite-dev && \
    cp /usr/lib/libsqlite3.so ./libe_sqlite3.so && \
    apk del sqlite-dev && \
    openssl version

RUN chmod -R 755 scripts && \
    mv scripts/container-entrypoints.sh .

USER upnp-dashboard

WORKDIR /app/data
WORKDIR /app/config
VOLUME [ "/app/config", "/app/data" ]

EXPOSE 8080/tcp
EXPOSE 8081/tcp

WORKDIR /app

ENTRYPOINT ["./container-entrypoints.sh"]
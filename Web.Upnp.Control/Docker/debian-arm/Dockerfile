FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-buster-slim-arm32v7 AS base

RUN adduser -u 5678 --disabled-password --home /app --gecos "" upnp-dashboard

WORKDIR /app
COPY . .

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
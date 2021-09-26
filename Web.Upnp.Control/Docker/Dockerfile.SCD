FROM node:latest AS node_base
FROM mcr.microsoft.com/dotnet/sdk:6.0-buster-slim AS publish
COPY --from=node_base . .

WORKDIR /src
COPY "IoT.Device/IoT.Protocol/System.Common/common.props" "IoT.Device/IoT.Protocol/System.Common/"
COPY "IoT.Device/IoT.Protocol/System.Common/System.Common/System.Common.csproj" "IoT.Device/IoT.Protocol/System.Common/System.Common/"
COPY "IoT.Device/IoT.Protocol/System.Common/System.Common.Net/System.Common.Net.csproj" "IoT.Device/IoT.Protocol/System.Common/System.Common.Net/"
COPY "IoT.Device/IoT.Protocol/System.Common/System.Common.Net.Http/System.Common.Net.Http.csproj" "IoT.Device/IoT.Protocol/System.Common/System.Common.Net.Http/"
COPY "IoT.Device/IoT.Protocol/common.props" "IoT.Device/IoT.Protocol/"
COPY "IoT.Device/IoT.Protocol/IoT.Protocol/IoT.Protocol.csproj" "IoT.Device/IoT.Protocol/IoT.Protocol/"
COPY "IoT.Device/IoT.Protocol/IoT.Protocol.Soap/IoT.Protocol.Soap.csproj" "IoT.Device/IoT.Protocol/IoT.Protocol.Soap/"
COPY "IoT.Device/IoT.Protocol/IoT.Protocol.Upnp/IoT.Protocol.Upnp.csproj" "IoT.Device/IoT.Protocol/IoT.Protocol.Upnp/"
COPY "IoT.Device/common.props" "IoT.Device/"
COPY "IoT.Device/IoT.Device/IoT.Device.csproj" "IoT.Device/IoT.Device/"
COPY "IoT.Device/IoT.Device.Upnp/IoT.Device.Upnp.csproj" "IoT.Device/IoT.Device.Upnp/"
COPY "IoT.Device/IoT.Device.Xiaomi.Umi/IoT.Device.Xiaomi.Umi.csproj" "IoT.Device/IoT.Device.Xiaomi.Umi/"
COPY "Web.Upnp.Control/Web.Upnp.Control.csproj" "Web.Upnp.Control/"
RUN dotnet restore "Web.Upnp.Control/Web.Upnp.Control.csproj" -r alpine-x64
COPY . .

WORKDIR "/src/Web.Upnp.Control/ClientApp"
RUN npm install
WORKDIR "/src/Web.Upnp.Control"
RUN npm install && npm install -g gulp && gulp sass

RUN dotnet publish "Web.Upnp.Control.csproj" -c Release -r alpine-x64 /p:PublishTrimmed=true -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-alpine AS final
RUN adduser -u 5678 --disabled-password --home /app --gecos "" upnp-dashboard && chown -R upnp-dashboard /app
USER upnp-dashboard
WORKDIR /app

EXPOSE 8080
EXPOSE 8081

COPY --from=publish /app/publish .

ENTRYPOINT ["./Web.Upnp.Control"]

FROM node:latest AS node_base
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base

WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-dotnet-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" upnp-dashboard && chown -R upnp-dashboard /app
USER upnp-dashboard

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
COPY --from=node_base . .

#RUN apt-get update -yq && apt-get install curl gnupg -yq \
#    && curl -sL https://deb.nodesource.com/setup_16.x | bash && apt-get install nodejs -yq

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
RUN dotnet restore "Web.Upnp.Control/Web.Upnp.Control.csproj"
COPY . .
WORKDIR "/src/Web.Upnp.Control"
RUN dotnet build "Web.Upnp.Control.csproj" -c Release -o /app/build

FROM build AS publish
WORKDIR "/src/Web.Upnp.Control/ClientApp"
RUN npm install
WORKDIR "/src/Web.Upnp.Control"
RUN npm install && npm install -g gulp && gulp sass
RUN dotnet publish "Web.Upnp.Control.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Web.Upnp.Control.dll"]

ARG NET_VERSION

FROM mcr.microsoft.com/dotnet/sdk:${NET_VERSION} AS build

RUN apt-get update -yq && \
    apt-get install curl gnupg -yq && \
    curl -sL https://deb.nodesource.com/setup_current.x | bash && \
    apt-get install nodejs -yq

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

FROM build AS publish
WORKDIR "/src/Web.Upnp.Control/ClientApp"
RUN npm install && npm install -g gulp && gulp sass
WORKDIR "/src/Web.Upnp.Control"
RUN dotnet publish "Web.Upnp.Control.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:${NET_VERSION}-alpine AS final

EXPOSE 8080
EXPOSE 8081

WORKDIR /app/data
WORKDIR /app/config
VOLUME [ "/app/config", "/app/data" ]

WORKDIR /app

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-dotnet-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" upnp-dashboard && chown -R upnp-dashboard /app
USER upnp-dashboard
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "Web.Upnp.Control.dll"]
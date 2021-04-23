FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

ENV ASPNETCORE_URLS=http://+:8080

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-dotnet-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["Web.Upnp.Control/Web.Upnp.Control.csproj", "Web.Upnp.Control/"]
RUN dotnet restore "Web.Upnp.Control/Web.Upnp.Control.csproj"
COPY . .
WORKDIR "/src/Web.Upnp.Control"
RUN dotnet build "Web.Upnp.Control.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Web.Upnp.Control.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Web.Upnp.Control.dll"]

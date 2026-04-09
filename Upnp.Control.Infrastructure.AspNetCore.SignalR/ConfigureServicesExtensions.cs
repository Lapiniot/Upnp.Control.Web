using Microsoft.AspNetCore.Http.Connections;

namespace Upnp.Control.Infrastructure.AspNetCore.SignalR;

public static class ConfigureServicesExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddSignalRUpnpDiscoveryNotifications() =>
        services.AddSingleton<IObserver<UpnpDiscoveryEvent>, UpnpDiscoverySignalRNotifyObserver>();

        public IServiceCollection AddSignalRUpnpEventNotifications() => services
            .AddTransient<IObserver<AVTPropChangedEvent>, UpnpEventSignalRNotifyObserver>()
            .AddTransient<IObserver<RCPropChangedEvent>, UpnpEventSignalRNotifyObserver>();
    }

    extension(IEndpointRouteBuilder routeBuilder)
    {
        public IEndpointConventionBuilder MapUpnpEventsHub(string route,
        Action<HttpConnectionDispatcherOptions>? configureOptions = null) =>
        routeBuilder.MapHub<UpnpEventsHub>(route, options =>
        {
            ConfigureConnectionDefaults(options);
            configureOptions?.Invoke(options);
        });
    }

    private static void ConfigureConnectionDefaults(HttpConnectionDispatcherOptions options) =>
        options.Transports = HttpTransportType.WebSockets;
}
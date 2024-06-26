using Microsoft.AspNetCore.Http.Connections;

namespace Upnp.Control.Infrastructure.SignalR.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddSignalRUpnpDiscoveryNotifications(this IServiceCollection services) =>
        services.AddSingleton<IObserver<UpnpDiscoveryEvent>, UpnpDiscoverySignalRNotifyObserver>();

    public static IServiceCollection AddSignalRUpnpEventNotifications(this IServiceCollection services) => services
        .AddTransient<IObserver<AVTPropChangedEvent>, UpnpEventSignalRNotifyObserver>()
        .AddTransient<IObserver<RCPropChangedEvent>, UpnpEventSignalRNotifyObserver>();

    public static IEndpointConventionBuilder MapUpnpEventsHub(this IEndpointRouteBuilder routeBuilder, string route,
        Action<HttpConnectionDispatcherOptions>? configureOptions = null) =>
        routeBuilder.MapHub<UpnpEventsHub>(route, options =>
        {
            ConfigureConnectionDefaults(options);
            configureOptions?.Invoke(options);
        });

    private static void ConfigureConnectionDefaults(HttpConnectionDispatcherOptions options) =>
        options.Transports = HttpTransportType.WebSockets;
}
using Microsoft.AspNetCore.Http.Connections;
using Upnp.Control.Models.Events;

namespace Upnp.Control.Infrastructure.SignalR.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddSignalRUpnpDiscoveryNotifications(this IServiceCollection services) =>
        services.AddSingleton<IObserver<UpnpDiscoveryEvent>, UpnpDiscoverySignalRNotifyObserver>();

    public static IServiceCollection AddSignalRUpnpEventNotifications(this IServiceCollection services) =>
        services.AddSingleton<IObserver<UpnpEvent>, UpnpEventSignalRNotifyObserver>();

    public static IEndpointConventionBuilder MapUpnpEventsHub(this IEndpointRouteBuilder routeBuilder, string route,
        Action<HttpConnectionDispatcherOptions>? configureOptions = null)
    {
        return routeBuilder.MapHub<UpnpEventsHub>(route, options =>
        {
            ConfigureConnectionDefaults(options);
            configureOptions?.Invoke(options);
        });
    }

    private static void ConfigureConnectionDefaults(HttpConnectionDispatcherOptions options) =>
        options.Transports = HttpTransportType.WebSockets;
}
namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    /// <summary>
    /// Adds UPnP Event HTTP callbacks <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include 'deviceId' route parameter.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(UpnpEventCallbackServices))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static RouteGroupBuilder MapUpnpEventCallbacks(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern).ExcludeFromDescription();
        var methods = new[] { "NOTIFY" };
        var additionalContentTypes = new[] { "text/xml" };

        group.MapMethods("avt", methods, UpnpEventCallbackServices.NotifyAVTransportAsync);

        group.MapMethods("rc", methods, UpnpEventCallbackServices.NotifyRenderingControlAsync);

        return group;
    }
}
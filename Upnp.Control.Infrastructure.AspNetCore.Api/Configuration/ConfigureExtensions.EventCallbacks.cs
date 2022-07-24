namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    /// <summary>
    /// Adds UPnP Event HTTP callbacks <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include 'deviceId' route parameter.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapUpnpEventCallbacks(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern).ExcludeFromDescription();
        var methods = new[] { "NOTIFY" };
        var additionalContentTypes = new[] { "text/xml" };

        group.MapMethods("avt", methods, UpnpEventCallbackServices.NotifyAVTransportAsync)
            .Accepts<HttpRequest>(false, "application/xml", additionalContentTypes)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapMethods("rc", methods, UpnpEventCallbackServices.NotifyRenderingControlAsync)
            .Accepts<HttpRequest>(false, "application/xml", additionalContentTypes)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest);

        return group;
    }
}
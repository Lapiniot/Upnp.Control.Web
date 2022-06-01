namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    /// <summary>
    /// Adds UPnP Connections management API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include 'deviceId' route parameter.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapConnectionsApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var tags = new[] { "Connections" };

        var group = routeBuilder.MapGroup(pattern);

        group.MapGet("protocol-info", ConnectionsServices.GetProtocolInfoAsync)
            .Produces<CMProtocolInfo>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapGet("connections", ConnectionsServices.GetConnectionsAsync)
            .Produces<IEnumerable<string>>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapGet("connections/{connectionId}", ConnectionsServices.GetConnectionInfoAsync)
            .Produces<CMConnectionInfo>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        return group;
    }
}
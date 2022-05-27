namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static class ConfigureServicesExtensions
{
    /// <summary>
    /// Adds BrowseContent API <see cref="RouteEndpoint" /> to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include '{deviceId}' and '{path}' parameters.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapBrowseContentApiEndpoint(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        ArgumentNullException.ThrowIfNull(pattern);

        var group = routeBuilder.MapGroup(pattern);

        group.MapGet("", ContentDirectoryServices.BrowseAsync)
            .WithTags(new string[] { "ContentDirectory" })
            .Produces<CDContent>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        return group;
    }

    /// <summary>
    /// Adds Device API <see cref="RouteEndpoint" /> to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapDeviceApiEndpoint(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        ArgumentNullException.ThrowIfNull(pattern);

        var tags = new[] { "Device" };

        var group = routeBuilder.MapGroup(pattern);

        group.MapGet("{id}", DeviceServices.GetAsync)
            .WithTags(tags)
            .Produces<UpnpDevice>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("", DeviceServices.GetAllAsync)
            .WithTags(tags)
            .Produces<IAsyncEnumerable<UpnpDevice>>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status400BadRequest);

        return group;
    }
}
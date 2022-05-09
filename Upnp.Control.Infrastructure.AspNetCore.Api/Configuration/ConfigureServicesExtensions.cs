namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static class ConfigureServicesExtensions
{
    /// <summary>
    /// Adds BrowseContent API <see cref="RouteEndpoint" /> to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include '{deviceId}' and '{path}' parameters.</param>
    /// <returns>The <see cref="IEndpointRouteBuilder" /> that can be used to further customize the builder.</returns>
    public static IEndpointRouteBuilder MapBrowseContentApiEndpoint(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        ArgumentNullException.ThrowIfNull(pattern);

        routeBuilder.MapGet(pattern, ContentDirectoryServices.BrowseAsync)
            .Produces<CDContent>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
        .WithTags(new string[] { "ContentDirectory" })
        .WithName("BrowseAsync")
        .WithDisplayName("Browse");

        return routeBuilder;
    }

    /// <summary>
    /// Adds Device API <see cref="RouteEndpoint" /> to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern.</param>
    /// <returns>The <see cref="IEndpointRouteBuilder" /> that can be used to further customize the builder.</returns>
    public static IEndpointRouteBuilder MapDeviceApiEndpoint(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        ArgumentNullException.ThrowIfNull(pattern);

        var tags = new string[] { "Device" };

        routeBuilder.MapGet($"{pattern}/{{id}}", DeviceServices.GetAsync)
            .Produces<UpnpDevice>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags)
            .WithName("GetAsync")
            .WithDisplayName("Get");

        routeBuilder.MapGet(pattern, DeviceServices.GetAllAsync)
            .Produces<IAsyncEnumerable<UpnpDevice>>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags)
            .WithName("GetAllAsync")
            .WithDisplayName("GetAll");

        return routeBuilder;
    }
}
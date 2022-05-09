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

        routeBuilder.MapGet(pattern, BrowseAsync)
            .Produces<CDContent>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(new string[] { "ContentDirectory" })
            .WithName("Browse")
            .WithDisplayName("Browse");

        return routeBuilder;

        static Task<IResult> BrowseAsync(IAsyncQueryHandler<CDGetContentQuery, CDContent> handler,
            string deviceId, string? path, bool withParents = true, bool withResourceProps = false, bool withVendorProps = false,
            bool withMetadata = false, bool withDevice = true, uint take = 50, uint skip = 0,
            CancellationToken cancellationToken = default) =>
                ContentDirectoryServices.BrowseAsync(handler, deviceId, path,
                    new(withParents, withResourceProps, withVendorProps, withMetadata, withDevice, take, skip),
                    cancellationToken);
    }
}
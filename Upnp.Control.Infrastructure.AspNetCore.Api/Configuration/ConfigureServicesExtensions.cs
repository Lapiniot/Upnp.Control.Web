namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static class ConfigureServicesExtensions
{
    /// <summary>
    /// Adds BrowseContent API <see cref="RouteEndpoint" /> to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include '{deviceId}' and '{path}' parameters.</param>
    /// <returns>The <see cref="RouteHandlerBuilder" /> that can be used to further customize the endpoint.</returns>
    public static RouteHandlerBuilder MapBrowseContentApiEndpoint(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        ArgumentNullException.ThrowIfNull(pattern);

        return routeBuilder.MapGet(pattern, BrowseAsync)
            .Produces<CDContent>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(new string[] { "ContentDirectory" })
            .WithName("Browse")
            .WithDisplayName("Browse");

        static Task<IResult> BrowseAsync(IAsyncQueryHandler<CDGetContentQuery, CDContent> handler, CancellationToken cancellationToken,
            string deviceId, string? path, bool? withParents, bool? withResourceProps, bool? withVendorProps,
            bool? withMetadata, bool? withDevice, uint take = 50, uint skip = 0) =>
                ContentDirectoryServices.BrowseAsync(handler, deviceId, path,
                    new(withParents, withResourceProps, withVendorProps, withMetadata, withDevice, take, skip),
                    cancellationToken);
    }
}
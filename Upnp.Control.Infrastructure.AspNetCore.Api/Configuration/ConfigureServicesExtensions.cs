namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static class ConfigureServicesExtensions
{
    public static IEndpointConventionBuilder MapBrowseContentApiEndpoint(this IEndpointRouteBuilder routeBuilder, string basePath)
    {
        ArgumentNullException.ThrowIfNull(basePath);

        return routeBuilder
            .MapGet($"{basePath.TrimEnd('/')}/{{deviceId}}/items/{{*path}}",
                (IAsyncQueryHandler<CDGetContentQuery, CDContent> handler,
                string deviceId, string? path, GetContentOptionsBox options, CancellationToken ct) =>
                    handler!.ExecuteAsync(new CDGetContentQuery(deviceId, path, options), ct));
    }
}
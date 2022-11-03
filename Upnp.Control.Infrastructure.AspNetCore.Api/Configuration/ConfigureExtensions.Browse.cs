namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    /// <summary>
    /// Adds BrowseContent API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include '{deviceId}' and '{path}' parameters.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode", Justification = "Preserved manually.")]
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(ContentDirectoryServices))]
    public static RouteGroupBuilder MapBrowseContentApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern).WithTags("Content Directory");

        group.MapGet("", ContentDirectoryServices.BrowseAsync);

        return group;
    }
}
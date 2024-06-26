namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    /// <summary>
    /// Adds BrowseContent API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include '{deviceId}' and '{path}' parameters.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(ContentDirectoryServices))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static RouteGroupBuilder MapBrowseContentApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern).WithTags("Content Directory Browse");
        group.MapGet("", ContentDirectoryServices.BrowseAsync);
        return group;
    }

    /// <summary>
    /// Adds SearchContent API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include '{deviceId}' and '{path}' parameters.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(ContentDirectoryServices))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static RouteGroupBuilder MapSearchContentApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern).WithTags("Content Directory Search");
        group.MapGet("", ContentDirectoryServices.SearchAsync);
        return group;
    }

    /// <summary>
    /// Adds GetSearchCapabilities API support
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include '{deviceId}' and '{path}' parameters.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(ContentDirectoryServices))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static RouteGroupBuilder MapSearchCapabilitiesApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern).WithTags("Content Directory Search Capabilities");
        group.MapGet("", ContentDirectoryServices.GetSearchCapabilitiesAsync);
        return group;
    }
}
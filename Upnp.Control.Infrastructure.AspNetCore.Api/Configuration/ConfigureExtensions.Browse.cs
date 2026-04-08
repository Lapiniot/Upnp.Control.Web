namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    extension(IEndpointRouteBuilder routeBuilder)
    {
        /// <summary>
        /// Adds BrowseContent API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
        /// </summary>
        /// <param name="pattern">The route pattern. May include '{deviceId}' and '{path}' parameters.</param>
        /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
        [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(ContentDirectoryServices))]
        [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
        public RouteGroupBuilder MapBrowseContentApi(string pattern)
        {
            var group = routeBuilder.MapGroup(pattern).WithTags("Content Directory Browse");
            group.MapGet("", ContentDirectoryServices.BrowseAsync);
            return group;
        }

        /// <summary>
        /// Adds SearchContent API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
        /// </summary>
        /// <param name="pattern">The route pattern. May include '{deviceId}' and '{path}' parameters.</param>
        /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
        [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(ContentDirectoryServices))]
        [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
        public RouteGroupBuilder MapSearchContentApi(string pattern)
        {
            var group = routeBuilder.MapGroup(pattern).WithTags("Content Directory Search");
            group.MapGet("", ContentDirectoryServices.SearchAsync);
            return group;
        }

        /// <summary>
        /// Adds GetSearchCapabilities API support
        /// </summary>
        /// <param name="pattern">The route pattern. May include '{deviceId}' and '{path}' parameters.</param>
        /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
        [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(ContentDirectoryServices))]
        [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
        public RouteGroupBuilder MapSearchCapabilitiesApi(string pattern)
        {
            var group = routeBuilder.MapGroup(pattern).WithTags("Content Directory Search Capabilities");
            group.MapGet("", ContentDirectoryServices.GetSearchCapabilitiesAsync);
            return group;
        }
    }
}
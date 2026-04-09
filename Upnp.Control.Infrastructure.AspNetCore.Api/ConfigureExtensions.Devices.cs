namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static partial class ConfigureExtensions
{
    extension(IEndpointRouteBuilder routeBuilder)
    {
        /// <summary>
        /// Adds Device API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
        /// </summary>
        /// <param name="pattern">The route pattern.</param>
        /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
        [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(DeviceServices))]
        [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
        public RouteGroupBuilder MapDevicesApi(string pattern)
        {
            var group = routeBuilder.MapGroup(pattern).WithTags("Devices");
            group.MapGet("{id}", DeviceServices.GetAsync);
            group.MapGet("", DeviceServices.GetAllAsync)
                .Produces<IAsyncEnumerable<UpnpDevice>>(StatusCodes.Status200OK, MediaTypeNames.Application.Json);
            return group;
        }
    }
}
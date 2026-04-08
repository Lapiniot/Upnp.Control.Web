namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    extension(IEndpointRouteBuilder routeBuilder)
    {
        /// <summary>
        /// Adds Queue management API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
        /// </summary>
        /// <param name="pattern">The route pattern. May include 'deviceId' and 'queueId' route parameters.</param>
        /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
        [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(QueueServices))]
        [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
        public RouteGroupBuilder MapQueueApi(string pattern)
        {
            var group = routeBuilder.MapGroup(pattern).WithTags("Queue");
            group.MapPost("", QueueServices.AddAsync);
            group.MapDelete("", QueueServices.RemoveAllAsync);
            return group;
        }
    }
}
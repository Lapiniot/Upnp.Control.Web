namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    /// <summary>
    /// Adds Queue management API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include 'deviceId' and 'queueId' route parameters.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode")]
    public static RouteGroupBuilder MapQueueApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern)
            .WithTags("Queue");

        group.MapPost("", QueueServices.AddAsync)
            .Accepts<MediaSource>(false, "application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapDelete("", QueueServices.RemoveAllAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        return group;
    }
}
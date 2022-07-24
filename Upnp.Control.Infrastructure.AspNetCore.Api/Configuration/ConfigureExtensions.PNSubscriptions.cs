namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    /// <summary>
    /// Adds Push Notification Subscription API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapPushNotificationSubscriptionApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern)
            .WithTags("Push Notification Subscriptions");

        group.MapGet("", PushNotificationSubscriptionServices.GetStateAsync)
            .Produces<bool>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("", PushNotificationSubscriptionServices.SubscribeAsync)
            .Accepts<PushSubscription>(false, "application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapDelete("", PushNotificationSubscriptionServices.UnsubscribeAsync)
            .Accepts<PushSubscription>(false, "application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("server-key", PushNotificationSubscriptionServices.GetServerKeyAsync)
            .Produces(StatusCodes.Status200OK, null, "application/octet-stream")
            .Produces(StatusCodes.Status400BadRequest);

        return group;
    }
}
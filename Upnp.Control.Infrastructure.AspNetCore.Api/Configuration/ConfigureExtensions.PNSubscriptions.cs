namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    /// <summary>
    /// Adds Push Notification Subscription API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode")]
    public static RouteGroupBuilder MapPushNotificationSubscriptionApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern)
            .WithTags("Push Notification Subscriptions");

        group.MapGet("", PushNotificationSubscriptionServices.GetStateAsync);

        group.MapPost("", PushNotificationSubscriptionServices.SubscribeAsync);

        group.MapDelete("", PushNotificationSubscriptionServices.UnsubscribeAsync);

        group.MapGet("server-key", PushNotificationSubscriptionServices.GetServerKeyAsync);

        return group;
    }
}
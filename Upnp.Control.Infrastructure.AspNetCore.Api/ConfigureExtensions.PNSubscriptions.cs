namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static partial class ConfigureExtensions
{
    extension(IEndpointRouteBuilder routeBuilder)
    {
        /// <summary>
        /// Adds Push Notification Subscription API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
        /// </summary>
        /// <param name="pattern">The route pattern.</param>
        /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
        [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(PushNotificationSubscriptionServices))]
        [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
        public RouteGroupBuilder MapPushNotificationSubscriptionApi(string pattern)
        {
            var group = routeBuilder.MapGroup(pattern).WithTags("Push Notification Subscriptions");
            group.MapGet("", PushNotificationSubscriptionServices.GetStateAsync);
            group.MapPost("", PushNotificationSubscriptionServices.SubscribeAsync);
            group.MapDelete("", PushNotificationSubscriptionServices.UnsubscribeAsync);
            group.MapGet("server-key", PushNotificationSubscriptionServices.GetServerKeyAsync)
                .Produces(StatusCodes.Status200OK, contentType: MediaTypeNames.Application.Octet);
            return group;
        }
    }
}
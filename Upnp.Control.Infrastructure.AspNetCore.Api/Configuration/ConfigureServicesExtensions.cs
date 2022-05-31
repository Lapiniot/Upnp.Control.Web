namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static class ConfigureServicesExtensions
{
    /// <summary>
    /// Adds BrowseContent API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include '{deviceId}' and '{path}' parameters.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapBrowseContentApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        ArgumentNullException.ThrowIfNull(pattern);

        var group = routeBuilder.MapGroup(pattern);

        group.MapGet("", ContentDirectoryServices.BrowseAsync)
            .WithTags("ContentDirectory")
            .Produces<CDContent>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        return group;
    }

    /// <summary>
    /// Adds Device API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapDeviceApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        ArgumentNullException.ThrowIfNull(pattern);

        var tags = new[] { "Device" };

        var group = routeBuilder.MapGroup(pattern);

        group.MapGet("{id}", DeviceServices.GetAsync)
            .WithTags(tags)
            .Produces<UpnpDevice>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("", DeviceServices.GetAllAsync)
            .WithTags(tags)
            .Produces<IAsyncEnumerable<UpnpDevice>>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status400BadRequest);

        return group;
    }

    /// <summary>
    /// Adds Queue management API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include 'deviceId' and 'queueId' route parameters.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapQueueApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var tags = new[] { "Queue" };

        var group = routeBuilder.MapGroup(pattern);

        group.MapPost("", QueueServices.AddAsync)
            .Accepts<MediaSource>(false, "application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapDelete("", QueueServices.RemoveAllAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        return group;
    }

    /// <summary>
    /// Adds UPnP Connections management API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include 'deviceId' route parameter.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapConnectionsApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var tags = new[] { "Connections" };

        var group = routeBuilder.MapGroup(pattern);

        group.MapGet("protocol-info", ConnectionsServices.GetProtocolInfoAsync)
            .Produces<CMProtocolInfo>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapGet("connections", ConnectionsServices.GetConnectionsAsync)
            .Produces<IEnumerable<string>>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapGet("connections/{connectionId}", ConnectionsServices.GetConnectionInfoAsync)
            .Produces<CMConnectionInfo>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        return group;
    }

    /// <summary>
    /// Adds UPnP Event HTTP callbacks <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include 'deviceId' route parameter.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapUpnpEventCallbacks(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern);
        var methods = new[] { "NOTIFY" };
        var additionalContentTypes = new[] { "text/xml" };

        group.MapMethods("avt", methods, UpnpEventCallbackServices.NotifyAVTransportAsync)
            .Accepts<HttpRequest>(false, "application/xml", additionalContentTypes)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapMethods("rc", methods, UpnpEventCallbackServices.NotifyRenderingControlAsync)
            .Accepts<HttpRequest>(false, "application/xml", additionalContentTypes)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest);

        return group;
    }

    /// <summary>
    /// Adds Push Notification Subscription API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapPushNotificationSubscriptionApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern);

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
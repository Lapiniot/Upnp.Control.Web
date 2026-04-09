namespace Upnp.Control.Infrastructure.AspNetCore.Api;

/// <summary>
/// Class containing methods for managing push notification subscriptions.
/// </summary>
public static class PushNotificationSubscriptionServices
{
    /// <summary>
    /// Retrieves the current state of a push notification subscription for a given endpoint.
    /// </summary>
    /// <param name="handler">The query handler to execute the subscription state retrieval.</param>
    /// <param name="endpoint">The subscription endpoint URI to check.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either an Ok result with the subscription state, NotFound if no subscription exists, or ProblemHttpResult in case of an error.</returns>
    /// <response code="200">The subscription state was successfully retrieved.</response>
    /// <response code="404">No subscription exists for the specified endpoint.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<Ok<PushSubscriptionState>, NotFound, ProblemHttpResult>> GetStateAsync(
        IQueryHandler<PSGetQuery, PushNotificationSubscription> handler,
        Uri endpoint, CancellationToken cancellationToken)
    {
        try
        {
            var subscription = await handler.ExecuteAsync(new(endpoint), cancellationToken);
            if (subscription is not null)
            {
                return Ok(new PushSubscriptionState(subscription.Type, subscription.Created));
            }
            else
            {
                return NotFound();
            }
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().FullName);
        }
    }

    /// <summary>
    /// Creates a new push notification subscription.
    /// </summary>
    /// <param name="handler">The command handler to execute the subscription creation.</param>
    /// <param name="decoder">The base64 URL decoder to process cryptographic keys.</param>
    /// <param name="subscription">The subscription request containing type, endpoint, and cryptographic keys.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The subscription was successfully created.</response>
    /// <response code="400">The subscription request contains invalid data.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(PushSubscriptionRequest))]
    public static async Task<Results<NoContent, ProblemHttpResult>> SubscribeAsync(
        ICommandHandler<PSAddCommand> handler, IBase64UrlDecoder decoder,
        PushSubscriptionRequest subscription, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(subscription.Type, subscription.Endpoint,
                    decoder.FromBase64String(subscription.P256dhKey), decoder.FromBase64String(subscription.AuthKey)),
                cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().FullName);
        }
    }

    /// <summary>
    /// Removes an existing push notification subscription.
    /// </summary>
    /// <param name="handler">The command handler to execute the unsubscription.</param>
    /// <param name="endpoint">The subscription endpoint URI to remove.</param>
    /// <param name="type">The notification type to unsubscribe from.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The unsubscription was successfully processed.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<NoContent, ProblemHttpResult>> UnsubscribeAsync(
        ICommandHandler<PSRemoveCommand> handler,
        string endpoint, NotificationType type, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(type, new(endpoint)), cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().FullName);
        }
    }

    /// <summary>
    /// Retrieves the server's public key for push notification subscriptions.
    /// </summary>
    /// <param name="handler">The query handler to execute the server key retrieval.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either the server key as binary file content or ProblemHttpResult in case of an error.</returns>
    /// <response code="200">The server key was successfully retrieved.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<FileContentHttpResult, ProblemHttpResult>> GetServerKeyAsync(
        IQueryHandler<PSGetServerKeyQuery, byte[]> handler, CancellationToken cancellationToken)
    {
        try
        {
            var contents = await handler.ExecuteAsync(PSGetServerKeyQuery.Instance, cancellationToken);
            return Bytes(contents, MediaTypeNames.Application.Octet);
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().FullName);
        }
    }
}

/// <summary>
/// Represents a request to create a push notification subscription.
/// </summary>
/// <param name="Type">The type of notification (e.g., email, web push).</param>
/// <param name="Endpoint">The subscription endpoint URI where notifications will be sent.</param>
/// <param name="P256dhKey">The P256dh public key used for encrypting notification payloads.</param>
/// <param name="AuthKey">The authentication key used for validating the subscription.</param>
public record struct PushSubscriptionRequest
(
    NotificationType Type,
    Uri Endpoint,
    string P256dhKey,
    string AuthKey
);

/// <summary>
/// Represents the state of a push notification subscription.
/// </summary>
/// <param name="Type">The type of notification associated with the subscription.</param>
/// <param name="Created">The UTC timestamp when the subscription was created.</param>
public record struct PushSubscriptionState
(
    NotificationType Type,
    DateTimeOffset Created
);
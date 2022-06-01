namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    /// <summary>
    /// Adds Playlists Management API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include 'deviceId' and 'queueId' route parameters.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapPlaylistApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var tags = new[] { "Playlists Management" };

        var group = routeBuilder.MapGroup(pattern);

        group.MapGet("state", PlaylistServices.GetPlaylistStateAsync)
            .Produces(StatusCodes.Status200OK, null, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPost("", PlaylistServices.CreateAsync)
            .Accepts<string>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPost("items", PlaylistServices.CreateFromItemsAsync)
            .Accepts<CreatePlaylistParams>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPost("files", PlaylistServices.CreateFromFilesAsync)
            .Accepts<CreateFromFilesForm>("multipart/form-data")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPut("{playlistId}", PlaylistServices.RenameAsync)
            .Accepts<string>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPost("{playlistId}/copy", PlaylistServices.CopyAsync)
            .Accepts<string>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapDelete("", PlaylistServices.RemoveAsync)
            .Accepts<string[]>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPost("{playlistId}/items", PlaylistServices.AddItemsAsync)
            .Accepts<MediaSource>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPost("{playlistId}/feeds", PlaylistServices.AddFromFeedsAsync)
            .Accepts<FeedUrlSource>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPost("{playlistId}/files", PlaylistServices.AddFromFilesAsync)
            .Accepts<CreateFromFilesForm>("multipart/form-data")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapDelete("{playlistId}/items", PlaylistServices.RemoveItemsAsync)
            .Accepts<string[]>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        return group;
    }
}
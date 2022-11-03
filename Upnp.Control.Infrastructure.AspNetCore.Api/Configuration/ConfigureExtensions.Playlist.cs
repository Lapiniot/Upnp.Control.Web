namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    /// <summary>
    /// Adds Playlists Management API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include 'deviceId' and 'queueId' route parameters.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode", Justification = "Preserved manually.")]
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(PlaylistServices))]
    public static RouteGroupBuilder MapPlaylistApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern).WithTags("Playlists Management");

        group.MapGet("state", PlaylistServices.GetPlaylistStateAsync);

        group.MapPost("", PlaylistServices.CreateAsync);

        group.MapPost("items", PlaylistServices.CreateFromItemsAsync);

        group.MapPost("files", PlaylistServices.CreateFromFilesAsync);

        group.MapPut("{playlistId}", PlaylistServices.RenameAsync);

        group.MapPost("{playlistId}/copy", PlaylistServices.CopyAsync);

        group.MapDelete("", PlaylistServices.RemoveAsync);

        group.MapPost("{playlistId}/items", PlaylistServices.AddItemsAsync);

        group.MapPost("{playlistId}/feeds", PlaylistServices.AddFromFeedsAsync);

        group.MapPost("{playlistId}/files", PlaylistServices.AddFromFilesAsync);

        group.MapDelete("{playlistId}/items", PlaylistServices.RemoveItemsAsync);

        return group;
    }
}
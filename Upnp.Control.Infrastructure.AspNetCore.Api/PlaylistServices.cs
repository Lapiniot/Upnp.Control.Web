using System.Text;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class PlaylistServices
{
    public static Task CreateAsync(IAsyncCommandHandler<PLCreateCommand> handler,
        string deviceId, string title, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, title), cancellationToken);

    public static Task CreateAsync(IAsyncCommandHandler<PLCreateFromItemsCommand> handler,
        string deviceId, CreatePlaylistParams @params, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, @params), cancellationToken);

    public static Task CreateAsync(IAsyncCommandHandler<PLCreateFromFilesCommand> handler,
        string deviceId, IEnumerable<IFormFile> files, string title, bool useProxy, bool merge,
        CancellationToken cancellationToken) => handler.ExecuteAsync(new(deviceId, files.Select(f => new FormFileSource(f)), title, merge, useProxy), cancellationToken);

    public static Task RenameAsync(IAsyncCommandHandler<PLRenameCommand> handler,
        string deviceId, string playlistId, string title, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, playlistId, title), cancellationToken);

    public static Task CopyAsync(IAsyncCommandHandler<PLCopyCommand> handler,
        string deviceId, string playlistId, string title, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, playlistId, title), cancellationToken);

    public static Task RemoveAsync(IAsyncCommandHandler<PLRemoveCommand> handler,
        string deviceId, string[] ids, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, ids), cancellationToken);

    public static Task AddItemsAsync(IAsyncCommandHandler<PLAddItemsCommand> handler,
        string deviceId, string playlistId, MediaSource source, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, playlistId, source), cancellationToken);

    public static Task AddFromFeedsAsync(IAsyncCommandHandler<PLAddFeedUrlCommand> handler,
        string deviceId, string playlistId, FeedUrlSource source, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, playlistId, source), cancellationToken);

    public static Task AddFromFilesAsync(IAsyncCommandHandler<PLAddPlaylistFilesCommand> handler,
        string deviceId, string playlistId, IEnumerable<IFormFile> files, bool useProxy,
        CancellationToken cancellationToken) => handler.ExecuteAsync(new(deviceId, playlistId, files.Select(f => new FormFileSource(f)), useProxy), cancellationToken);

    public static Task RemoveItemsAsync(IAsyncCommandHandler<PLRemoveItemsCommand> handler,
        string deviceId, string playlistId, string[] items, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, playlistId, items), cancellationToken);

    public static async Task GetPlaylistStateAsync(IAsyncQueryHandler<SysPropsGetPlaylistStateQuery, string> handler,
        string deviceId, CancellationToken cancellationToken, HttpResponse httpResponse)
    {
        var content = await handler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);
        httpResponse.Headers.Add("Content-Type", "application/json");
        await httpResponse.Body.WriteAsync(Encoding.UTF8.GetBytes(content), cancellationToken).ConfigureAwait(false);
        await httpResponse.Body.FlushAsync(cancellationToken);
        await httpResponse.CompleteAsync();
    }
}
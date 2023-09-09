namespace Upnp.Control.Services.Commands;

internal sealed class PLAddFeedsCommandHandler(IUpnpServiceFactory serviceFactory, IHttpClientFactory httpClientFactory,
    IServerAddressesProvider serverAddressesProvider, ILogger<PLAddFeedsCommandHandler> logger,
    IOptionsSnapshot<PlaylistOptions> options) : PLFeedsCommandBase(serviceFactory, httpClientFactory, serverAddressesProvider, options, logger),
    IAsyncCommandHandler<PLAddPlaylistFilesCommand>,
    IAsyncCommandHandler<PLAddFeedUrlCommand>
{
    #region Implementation of IAsyncCommandHandler<PLAddPlaylistFilesCommand>

    Task IAsyncCommandHandler<PLAddPlaylistFilesCommand>.ExecuteAsync(PLAddPlaylistFilesCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);
        ArgumentNullException.ThrowIfNull(command.Files);
        ArgumentException.ThrowIfNullOrEmpty(command.DeviceId);
        ArgumentException.ThrowIfNullOrEmpty(command.PlaylistId);

        var (deviceId, playlistId, files, useProxy) = command;

        return AddFromFilesAsync(deviceId, playlistId, files, useProxy, cancellationToken);
    }

    #endregion

    #region Implementation of IAsyncCommandHandler<PLAddFeedUrlCommand>

    Task IAsyncCommandHandler<PLAddFeedUrlCommand>.ExecuteAsync(PLAddFeedUrlCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);
        ArgumentNullException.ThrowIfNull(command.Source);
        ArgumentNullException.ThrowIfNull(command.Source.Url);
        ArgumentException.ThrowIfNullOrEmpty(command.DeviceId);
        ArgumentException.ThrowIfNullOrEmpty(command.PlaylistId);

        var (deviceId, playlistId, (url, title, useProxy)) = command;

        return AddFromUrlAsync(deviceId, playlistId, url, title, useProxy, cancellationToken);
    }

    #endregion
}
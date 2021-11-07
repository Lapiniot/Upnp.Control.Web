using Microsoft.Extensions.Options;
using Upnp.Control.Models;
using Upnp.Control.Services;
using Web.Upnp.Control.Configuration;

using static System.Globalization.CultureInfo;

namespace Web.Upnp.Control.Services.Commands;

public sealed class PLAddFeedsCommandHandler : PLFeedsCommandBase,
    IAsyncCommandHandler<PLAddPlaylistFilesCommand>,
    IAsyncCommandHandler<PLAddFeedUrlCommand>
{
    public PLAddFeedsCommandHandler(IUpnpServiceFactory serviceFactory, IHttpClientFactory httpClientFactory,
        IServerAddressesProvider serverAddressesProvider, ILogger<PLAddFeedsCommandHandler> logger, IOptionsSnapshot<PlaylistOptions> options) :
        base(serviceFactory, httpClientFactory, serverAddressesProvider, options, logger)
    {
    }

    #region Implementation of IAsyncCommandHandler<PLAddPlaylistFilesCommand>

    Task IAsyncCommandHandler<PLAddPlaylistFilesCommand>.ExecuteAsync(PLAddPlaylistFilesCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        return command switch
        {
            { DeviceId: null or "" } => throw new ArgumentException(string.Format(InvariantCulture, MissingArgumentErrorFormat, nameof(PLAddItemsCommand.DeviceId))),
            { PlaylistId: null or "" } => throw new ArgumentException(string.Format(InvariantCulture, MissingArgumentErrorFormat, nameof(PLAddItemsCommand.PlaylistId))),
            { DeviceId: { } deviceId, PlaylistId: { } playlistId, Files: { } files, UseProxy: var useProxy } =>
                AddFromFilesAsync(deviceId, playlistId, files, useProxy, cancellationToken),
            _ => throw new ArgumentException("Valid file must be provided")
        };
    }

    #endregion

    #region Implementation of IAsyncCommandHandler<PLAddFeedUrlCommand>

    Task IAsyncCommandHandler<PLAddFeedUrlCommand>.ExecuteAsync(PLAddFeedUrlCommand command, CancellationToken cancellationToken)
    {
        return command switch
        {
            { DeviceId: null or "" } => throw new ArgumentException(string.Format(InvariantCulture, MissingArgumentErrorFormat, nameof(PLAddItemsCommand.DeviceId))),
            { PlaylistId: null or "" } => throw new ArgumentException(string.Format(InvariantCulture, MissingArgumentErrorFormat, nameof(PLAddItemsCommand.PlaylistId))),
            { DeviceId: { } deviceId, PlaylistId: { } playlistId, Source: { Url: { } url, Title: var title, UseProxy: var useProxy } } =>
                AddFromUrlAsync(deviceId, playlistId, url, title, useProxy, cancellationToken),
            _ => throw new ArgumentException("Valid feed url must be provided")
        };
    }

    #endregion
}
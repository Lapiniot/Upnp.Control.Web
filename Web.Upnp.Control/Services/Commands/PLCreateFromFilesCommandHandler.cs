using System.Globalization;
using Microsoft.Extensions.Options;
using Upnp.Control.Models;
using Upnp.Control.Services;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

using static System.String;

namespace Web.Upnp.Control.Services.Commands;

public sealed class PLCreateFromFilesCommandHandler : PLFeedsCommandBase, IAsyncCommandHandler<PLCreateFromFilesCommand>
{
    public PLCreateFromFilesCommandHandler(IUpnpServiceFactory serviceFactory, IHttpClientFactory httpClientFactory,
        IServerAddressesProvider serverAddressesProvider, IOptionsSnapshot<PlaylistOptions> options,
        ILogger<PLCreateFromFilesCommandHandler> logger) :
        base(serviceFactory, httpClientFactory, serverAddressesProvider, options, logger)
    {
    }

    public Task ExecuteAsync(PLCreateFromFilesCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        return command switch
        {
            { DeviceId: null or "" } => throw new ArgumentException(Format(CultureInfo.InvariantCulture, MissingArgumentErrorFormat, nameof(PLAddItemsCommand.DeviceId))),
            { DeviceId: { } deviceId, Files: { } files, UseProxy: var useProxy, Title: var title, Merge: var merge } =>
                CreateFromFilesAsync(deviceId, files, title, useProxy, merge, cancellationToken),
            _ => throw new ArgumentException("Valid file source must be provided")
        };
    }

    private async Task CreateFromFilesAsync(string deviceId, IEnumerable<IFileSource> files, string title, bool? useProxy, bool? merge, CancellationToken cancellationToken)
    {
        if(merge == true)
        {
            await CreateFromFilesAsync(deviceId, files,
                !IsNullOrWhiteSpace(title) ? title : Join("; ", files.Select(f => f.FileName)),
                useProxy, cancellationToken).ConfigureAwait(false);

        }
        else
        {
            foreach(var file in files)
            {
                await CreateFromFilesAsync(deviceId, new[] { file },
                    !IsNullOrWhiteSpace(title) ? $"{title}: {file.FileName}" : file.FileName,
                    useProxy, cancellationToken).ConfigureAwait(false);
            }
        }
    }
}
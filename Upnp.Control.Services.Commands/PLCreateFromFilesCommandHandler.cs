using System.Globalization;
using Upnp.Control.Services.Commands.Configuration;
using static System.String;

namespace Upnp.Control.Services.Commands;

internal sealed class PLCreateFromFilesCommandHandler : PLFeedsCommandBase, IAsyncCommandHandler<PLCreateFromFilesCommand>
{
    public PLCreateFromFilesCommandHandler(IUpnpServiceFactory serviceFactory, IHttpClientFactory httpClientFactory,
        IServerAddressesProvider serverAddressesProvider, IOptionsSnapshot<PlaylistOptions> options,
        ILogger<PLCreateFromFilesCommandHandler> logger) :
        base(serviceFactory, httpClientFactory, serverAddressesProvider, options, logger)
    { }

    private async Task CreateFromFilesAsync(string deviceId, IEnumerable<FileSource> files, string title, bool? useProxy, bool? merge, CancellationToken cancellationToken)
    {
        if (merge == true)
        {
            if (title is { Length: > 0 })
            {
                await CreateFromFilesAsync(deviceId, files, title, useProxy, cancellationToken).ConfigureAwait(false);
            }
            else
            {
                var sources = files.ToList();
                await CreateFromFilesAsync(deviceId, sources, Join("; ", sources.Select(f => f.FileName)), useProxy, cancellationToken).ConfigureAwait(false);
            }
        }
        else
        {
            foreach (var file in files)
            {
                await CreateFromFilesAsync(deviceId, new[] { file },
                    !IsNullOrWhiteSpace(title) ? $"{title}: {file.FileName}" : file.FileName,
                    useProxy, cancellationToken).ConfigureAwait(false);
            }
        }
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
}
using static System.String;

namespace Upnp.Control.Services.Commands;

internal sealed class PLCreateFromFilesCommandHandler(IUpnpServiceFactory serviceFactory, IHttpClientFactory httpClientFactory,
    IServerAddressesProvider serverAddressesProvider, IOptionsSnapshot<PlaylistOptions> options,
    ILogger<PLCreateFromFilesCommandHandler> logger) : PLFeedsCommandBase(serviceFactory, httpClientFactory, serverAddressesProvider, options, logger), IAsyncCommandHandler<PLCreateFromFilesCommand>
{
    private async Task CreateFromFilesAsync(string deviceId, IEnumerable<FileSource> files, string title, bool useProxy, bool merge, CancellationToken cancellationToken)
    {
        if (merge)
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
                await CreateFromFilesAsync(deviceId, [file],
                    !IsNullOrWhiteSpace(title) ? $"{title}: {file.FileName}" : file.FileName,
                    useProxy, cancellationToken).ConfigureAwait(false);
            }
        }
    }

    public Task ExecuteAsync(PLCreateFromFilesCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command.Files);
        ArgumentException.ThrowIfNullOrEmpty(command.DeviceId);

        return CreateFromFilesAsync(command.DeviceId, command.Files, command.Title, command.UseProxy, command.Merge, cancellationToken);
    }
}
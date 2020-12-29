using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static System.String;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLCreateFromFilesCommandHandler : PLFeedsCommandBase, IAsyncCommandHandler<PLCreateFromFilesCommand>
    {
        public PLCreateFromFilesCommandHandler(IUpnpServiceFactory serviceFactory, IHttpClientFactory httpClientFactory,
            IServer server, IOptionsSnapshot<PlaylistOptions> options, ILogger<PLCreateFromFilesCommandHandler> logger) :
            base(serviceFactory, httpClientFactory, server, options, logger)
        {
        }

        public Task ExecuteAsync(PLCreateFromFilesCommand command, CancellationToken cancellationToken)
        {
            return command switch
            {
                { DeviceId: null or "" } => throw new ArgumentException(string.Format(MissingArgumentErrorFormat, nameof(PLAddItemsCommand.DeviceId))),
                { DeviceId: { } deviceId, Source: { Files: { } files, UseProxy: var useProxy }, Title: var title, Merge: var merge } =>
                    CreateFromFilesAsync(deviceId, files, title, useProxy, merge, cancellationToken),
                _ => throw new ArgumentException("Valid file source must be provided")
            };
        }

        private async Task CreateFromFilesAsync(string deviceId, IEnumerable<IFormFile> files, string title, bool? useProxy, bool? merge, CancellationToken cancellationToken)
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
}
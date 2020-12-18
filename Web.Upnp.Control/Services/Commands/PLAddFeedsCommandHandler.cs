using System;
using System.Threading;
using System.Threading.Tasks;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLAddFeedsCommandHandler : PLCommandBase, IAsyncCommandHandler<PLAddFeedCommand>
    {
        public PLAddFeedsCommandHandler(IUpnpServiceFactory factory) : base(factory)
        {
        }
        public Task ExecuteAsync(PLAddFeedCommand command, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
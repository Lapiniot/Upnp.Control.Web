using System;
using System.Threading;
using System.Threading.Tasks;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class PSRemoveCommandHandler : IAsyncCommandHandler<PSRemoveCommand>
    {
        public Task ExecuteAsync(PSRemoveCommand command, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
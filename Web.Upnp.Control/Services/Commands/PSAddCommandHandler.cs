using System;
using System.Threading;
using System.Threading.Tasks;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class PSAddCommandHandler : IAsyncCommandHandler<PSAddCommand>
    {
        public PSAddCommandHandler()
        {
        }

        public Task ExecuteAsync(PSAddCommand command, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
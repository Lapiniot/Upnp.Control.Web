using System.Threading;
using System.Threading.Tasks;

namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IAsyncCommand<TParams>
    {
        Task ExecuteAsync(TParams commandParameters, CancellationToken cancellationToken);
    }
}
using System.Threading;
using System.Threading.Tasks;

namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IAsyncCommand<in TParams>
    {
        Task ExecuteAsync(TParams commandParameters, CancellationToken cancellationToken);
    }
}
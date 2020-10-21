using System.Threading;
using System.Threading.Tasks;

namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IAsyncQuery<TParams, TOutput>
    {
        Task<TOutput> ExecuteAsync(TParams queryParameters, CancellationToken cancellationToken);
    }
}
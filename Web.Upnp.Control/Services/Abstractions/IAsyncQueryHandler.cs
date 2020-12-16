using System.Threading;
using System.Threading.Tasks;

namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IAsyncQueryHandler<in TQuery, TQueryResult>
    {
        Task<TQueryResult> ExecuteAsync(TQuery query, CancellationToken cancellationToken);
    }
}
using System.Threading;
using System.Collections.Generic;

namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IAsyncEnumerableQuery<TParams, TOutput>
    {
        IAsyncEnumerable<TOutput> ExecuteAsync(TParams queryParameters, CancellationToken cancellationToken);
    }
}
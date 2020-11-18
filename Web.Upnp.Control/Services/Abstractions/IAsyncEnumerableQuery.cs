using System.Collections.Generic;
using System.Threading;

namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IAsyncEnumerableQuery<in TParams, out TOutput>
    {
        IAsyncEnumerable<TOutput> ExecuteAsync(TParams queryParameters, CancellationToken cancellationToken);
    }
}
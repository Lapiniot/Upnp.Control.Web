namespace Upnp.Control.Services;

public interface IAsyncEnumerableQueryHandler<in TQuery, out TQueryResult>
{
    IAsyncEnumerable<TQueryResult> ExecuteAsync(TQuery query, CancellationToken cancellationToken);
}
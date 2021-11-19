namespace Upnp.Control.Abstractions;

public interface IAsyncEnumerableQueryHandler<in TQuery, out TQueryResult>
{
    IAsyncEnumerable<TQueryResult> ExecuteAsync(TQuery query, CancellationToken cancellationToken);
}
namespace Upnp.Control.Abstractions;

public interface IEnumerableQueryHandler<in TQuery, out TQueryResult>
{
    IAsyncEnumerable<TQueryResult> ExecuteAsync(TQuery query, CancellationToken cancellationToken);
}
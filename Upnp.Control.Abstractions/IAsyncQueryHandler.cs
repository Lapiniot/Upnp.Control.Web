namespace Upnp.Control.Abstractions;

public interface IAsyncQueryHandler<in TQuery, TQueryResult>
{
    Task<TQueryResult> ExecuteAsync(TQuery query, CancellationToken cancellationToken);
}
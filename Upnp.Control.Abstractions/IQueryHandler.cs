namespace Upnp.Control.Abstractions;

public interface IQueryHandler<in TQuery, TQueryResult>
{
    Task<TQueryResult> ExecuteAsync(TQuery query, CancellationToken cancellationToken);
}
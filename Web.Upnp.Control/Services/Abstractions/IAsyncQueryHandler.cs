namespace Web.Upnp.Control.Services.Abstractions;

public interface IAsyncQueryHandler<in TQuery, TQueryResult>
{
    Task<TQueryResult> ExecuteAsync(TQuery query, CancellationToken cancellationToken);
}
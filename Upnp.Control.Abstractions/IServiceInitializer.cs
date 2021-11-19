namespace Upnp.Control.Abstractions;

public interface IServiceInitializer
{
    Task InitializeAsync(CancellationToken cancellationToken);
}
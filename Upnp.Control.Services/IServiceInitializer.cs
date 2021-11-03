namespace Upnp.Control.Services;

public interface IServiceInitializer
{
    Task InitializeAsync(CancellationToken cancellationToken);
}
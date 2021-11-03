namespace Upnp.Control.Services;

public interface IAsyncCommandHandler<in TCommand>
{
    Task ExecuteAsync(TCommand command, CancellationToken cancellationToken);
}
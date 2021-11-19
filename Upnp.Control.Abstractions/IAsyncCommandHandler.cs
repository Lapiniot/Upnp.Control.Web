namespace Upnp.Control.Abstractions;

public interface IAsyncCommandHandler<in TCommand>
{
    Task ExecuteAsync(TCommand command, CancellationToken cancellationToken);
}
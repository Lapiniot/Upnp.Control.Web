namespace Upnp.Control.Abstractions;

public interface ICommandHandler<in TCommand>
{
    Task ExecuteAsync(TCommand command, CancellationToken cancellationToken);
}
namespace Web.Upnp.Control.Services.Abstractions;

public interface IAsyncCommandHandler<in TCommand>
{
    Task ExecuteAsync(TCommand command, CancellationToken cancellationToken);
}
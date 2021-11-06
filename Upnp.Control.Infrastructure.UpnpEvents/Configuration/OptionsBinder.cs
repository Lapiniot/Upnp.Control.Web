namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

public abstract class OptionsBinder<TOptions> where TOptions : class
{
    public abstract void Bind(TOptions options, IConfiguration configuration);
}
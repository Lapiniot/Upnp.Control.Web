namespace Upnp.Control.Infrastructure.Configuration;

public abstract class OptionsBinder<TOptions> where TOptions : class
{
    public abstract void Bind(TOptions options, IConfiguration configuration);
}
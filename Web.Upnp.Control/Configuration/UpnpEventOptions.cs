namespace Web.Upnp.Control.Configuration;

public record UpnpEventOptions
{
    public TimeSpan SessionTimeout { get; init; } = TimeSpan.FromMinutes(15);
}
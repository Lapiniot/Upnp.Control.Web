namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

public record UpnpEventsOptions
{
    public TimeSpan SessionTimeout { get; init; } = TimeSpan.FromMinutes(15);
}
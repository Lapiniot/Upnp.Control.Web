namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

public class UpnpEventsOptions
{
    public TimeSpan SessionTimeout { get; set; } = TimeSpan.FromMinutes(15);
    public IDictionary<string, string> CallbackMappings { get; } = new Dictionary<string, string>();
}
using System.ComponentModel.DataAnnotations;

namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

public class UpnpEventsOptions
{
    [Required, Timestamp]
    public TimeSpan SessionTimeout { get; set; } = TimeSpan.FromMinutes(15);
    public IDictionary<string, string> CallbackMappings { get; } = new Dictionary<string, string>();
}

[OptionsValidator]
internal sealed partial class UpnpEventsOptionsValidator : IValidateOptions<UpnpEventsOptions> { }
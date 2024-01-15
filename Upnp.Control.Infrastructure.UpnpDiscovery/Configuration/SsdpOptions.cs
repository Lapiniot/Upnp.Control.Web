using System.ComponentModel.DataAnnotations;

namespace Upnp.Control.Infrastructure.UpnpDiscovery.Configuration;

public class SsdpOptions
{
    [Required]
    public string MulticastInterface { get; set; } = "auto";

    [Range(1, 3600)]
    public int SearchIntervalSeconds { get; set; } = 60;

    [Range(1, byte.MaxValue)]
    public byte MulticastTTL { get; set; } = 1;
}

[OptionsValidator]
internal sealed partial class SsdpOptionsValidator : IValidateOptions<SsdpOptions> { }
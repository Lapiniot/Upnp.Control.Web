using System.ComponentModel.DataAnnotations;

namespace Upnp.Control.Services.Commands.Configuration;

public class PlaylistOptions
{
    [Required]
    public string DefaultEncoding { get; set; } = "ISO-8859-1";

    [Required, Timestamp]
    public TimeSpan FeedMetadataRequestTimeout { get; set; } = TimeSpan.FromSeconds(10);

    [Range(1, 10)]
    public int MaxContainerScanDepth { get; set; } = 3;
}

[OptionsValidator]
internal sealed partial class PlaylistOptionsValidator : IValidateOptions<PlaylistOptions> { }
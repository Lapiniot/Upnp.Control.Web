namespace Upnp.Control.Services.Commands.Configuration;

public class PlaylistOptions
{
    public string DefaultEncoding { get; set; } = "ISO-8859-1";

    public TimeSpan FeedMetadataRequestTimeout { get; set; } = TimeSpan.FromSeconds(10);

    public int MaxContainerScanDepth { get; set; } = 3;
}
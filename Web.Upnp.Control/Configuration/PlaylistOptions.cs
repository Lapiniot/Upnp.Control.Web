namespace Web.Upnp.Control.Configuration
{
    public record PlaylistOptions
    {
        public string DefaultEncoding { get; init; } = "ISO-8859-1";

        public TimeSpan FeedMetadataRequestTimeout { get; init; } = TimeSpan.FromSeconds(10);

        public int MaxContainerScanDepth { get; set; } = 3;
    }
}
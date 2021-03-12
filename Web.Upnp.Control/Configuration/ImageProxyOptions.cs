namespace Web.Upnp.Control.Configuration
{
    public record ImageProxyOptions
    {
        public string CacheControl { get; init; } = null;
        public int BufferSize { get; init; } = 16 * 1024;
    }
}
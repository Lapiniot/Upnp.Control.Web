namespace Upnp.Control.Infrastructure.Middleware.Configuration;

public record ImageProxyOptions
{
    public string CacheControl { get; init; }
    public string VaryBy { get; init; }
    public int BufferSize { get; init; } = 16 * 1024;
}
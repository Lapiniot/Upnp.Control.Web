namespace Upnp.Control.Infrastructure.AspNetCore.Configuration;

public class ImageProxyOptions
{
    public string? CacheControl { get; set; }
    public string? VaryBy { get; set; }
    public int BufferSize { get; set; } = 16 * 1024;
}
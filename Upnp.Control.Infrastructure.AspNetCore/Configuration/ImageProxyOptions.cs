namespace Upnp.Control.Infrastructure.AspNetCore.Configuration;

public record ImageProxyOptions(string CacheControl, string VaryBy, int BufferSize = 16 * 1024);
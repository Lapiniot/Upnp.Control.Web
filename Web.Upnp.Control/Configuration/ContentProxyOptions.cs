namespace Web.Upnp.Control.Configuration;

public record ContentProxyOptions
{
    public int BufferSize { get; init; } = 16 * 1024;
}
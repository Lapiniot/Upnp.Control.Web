using System.ComponentModel.DataAnnotations;

namespace Upnp.Control.Infrastructure.AspNetCore.Configuration;

public class ImageProxyOptions
{
    public string? CacheControl { get; set; }
    public string? VaryBy { get; set; }

    [Range(1024, 64 * 1024)]
    public int BufferSize { get; set; } = 16 * 1024;
}

[OptionsValidator]
internal sealed partial class ImageProxyOptionsValidator : IValidateOptions<ImageProxyOptions> { }
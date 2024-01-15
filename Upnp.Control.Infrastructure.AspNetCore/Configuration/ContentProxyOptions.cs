using System.ComponentModel.DataAnnotations;

namespace Upnp.Control.Infrastructure.AspNetCore.Configuration;

public class ContentProxyOptions
{
    [Range(1024, 64 * 1024)]
    public int BufferSize { get; set; } = 16 * 1024;
}

[OptionsValidator]
internal sealed partial class ContentProxyOptionsValidator : IValidateOptions<ContentProxyOptions> { }
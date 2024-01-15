using System.ComponentModel.DataAnnotations;
using static System.StringComparison;

namespace Upnp.Control.Infrastructure.PushNotifications;

public class WebPushOptions
{
    [Required, JwtSubject]
    public string JwtSubject { get; set; } = "mailto:upnp.dashboard@gmail.com";

    [Range(60, 86400)]
    public int JwtExpiresSeconds { get; set; } = 3600;

    [Range(5, 86400)]
    public int TTLSeconds { get; set; } = 3600;
}

internal sealed class JwtSubjectAttribute : DataTypeAttribute
{
    public JwtSubjectAttribute() : base(DataType.Custom) =>
        ErrorMessage = "The value is not a valid fully-qualified http, https or mailto: URL.";

    public override bool IsValid(object value)
    {
        if (value is null) return true;

        return value is string { Length: > 0 } str &&
            (str.StartsWith("http://", OrdinalIgnoreCase) ||
            str.StartsWith("https://", OrdinalIgnoreCase) ||
            str.StartsWith("mailto:", OrdinalIgnoreCase) &&
                str.IndexOf('@', OrdinalIgnoreCase) is > 0 and var i &&
                str.LastIndexOf('@') == i);
    }
}

[OptionsValidator]
internal sealed partial class WebPushOptionsValidator : IValidateOptions<WebPushOptions> { }
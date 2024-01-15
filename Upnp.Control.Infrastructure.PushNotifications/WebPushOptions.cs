using System.ComponentModel.DataAnnotations;
using System.Threading.Channels;
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

    [Range(10, 120 * 1000)]
    public int TimeoutMiliseconds { get; set; } = 5 * 1000;

    [Range(5, 1000)]
    public int QueueCapacity { get; set; } = 100;

    [EnumDataType(typeof(BoundedChannelFullMode))]
    public BoundedChannelFullMode QueueFullMode { get; set; } = BoundedChannelFullMode.DropOldest;
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
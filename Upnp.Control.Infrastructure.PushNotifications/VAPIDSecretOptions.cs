using System.ComponentModel.DataAnnotations;

namespace Upnp.Control.Infrastructure.PushNotifications;

#pragma warning disable CA1819 // Properties should not return arrays

[UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "<Pending>")]
public class VAPIDSecretOptions
{
    [Required, MinLength(65)]
    public byte[] PublicKey { get; set; }

    [Required, MinLength(32)]
    public byte[] PrivateKey { get; set; }
}

[OptionsValidator]
internal sealed partial class VAPIDSecretOptionsValidator : IValidateOptions<VAPIDSecretOptions> { }
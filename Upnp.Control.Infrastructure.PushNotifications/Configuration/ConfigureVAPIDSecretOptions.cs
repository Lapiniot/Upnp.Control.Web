using Upnp.Control.Abstractions;

namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

internal sealed class ConfigureVAPIDSecretOptions : IConfigureOptions<VAPIDSecretOptions>, IBase64UrlDecoder
{
    private readonly IConfiguration configuration;
    private readonly IBase64UrlDecoder decoder;

    public ConfigureVAPIDSecretOptions(IConfiguration configuration, IBase64UrlDecoder decoder = null)
    {
        this.configuration = configuration;
        this.decoder = decoder ?? this;
    }

    byte[] IBase64UrlDecoder.Decode(string input) => Encoders.FromBase64String(input);

    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public void Configure(VAPIDSecretOptions options)
    {
        if (configuration.GetSection("VAPID") is not { } section || !section.Exists()) return;

        if (section.GetValue<string>("PublicKey") is { } publicKey)
        {
            options.PublicKey = decoder.Decode(publicKey);
        }

        if (section.GetValue<string>("PrivateKey") is { } privateKey)
        {
            options.PrivateKey = decoder.Decode(privateKey);
        }
    }
}
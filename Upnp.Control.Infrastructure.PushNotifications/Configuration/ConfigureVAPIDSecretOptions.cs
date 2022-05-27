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
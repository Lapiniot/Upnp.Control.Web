using Upnp.Control.Abstractions;

namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

internal sealed class ConfigureVAPIDSecretOptions(IConfiguration configuration, IBase64UrlDecoder decoder) : IConfigureOptions<VAPIDSecretOptions>
{
    private readonly IConfiguration configuration = configuration;
    private readonly IBase64UrlDecoder decoder = decoder;

    public void Configure(VAPIDSecretOptions options)
    {
        if (configuration.GetSection("VAPID") is not { } section || !section.Exists()) return;

        if (section.GetValue<string>("PublicKey") is { } publicKey)
        {
            options.PublicKey = decoder.FromBase64String(publicKey);
        }

        if (section.GetValue<string>("PrivateKey") is { } privateKey)
        {
            options.PrivateKey = decoder.FromBase64String(privateKey);
        }
    }
}
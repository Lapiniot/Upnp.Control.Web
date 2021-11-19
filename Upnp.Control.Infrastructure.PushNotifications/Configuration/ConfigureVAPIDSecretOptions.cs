using Upnp.Control.Abstractions;

namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal class ConfigureVAPIDSecretOptions : IConfigureOptions<VAPIDSecretOptions>, IBase64UrlDecoder
{
    private readonly IConfiguration configuration;
    private readonly IBase64UrlDecoder decoder;

    public ConfigureVAPIDSecretOptions(IConfiguration configuration, IBase64UrlDecoder decoder = null)
    {
        this.configuration = configuration;
        this.decoder = decoder ?? this;
    }

    public void Configure(VAPIDSecretOptions options)
    {
        if(configuration.GetSection("VAPID") is { } section && section.Exists())
        {
            if(section.GetValue<string>("PublicKey") is { } publicKey)
            {
                options.PublicKey = decoder.Decode(publicKey);
            }

            if(section.GetValue<string>("PrivateKey") is { } privateKey)
            {
                options.PrivateKey = decoder.Decode(privateKey);
            }
        }
    }

    byte[] IBase64UrlDecoder.Decode(string input)
    {
        return Encoders.FromBase64String(input);
    }
}
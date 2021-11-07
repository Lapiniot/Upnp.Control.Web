namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal class ConfigureVAPIDSecretOptions : IConfigureOptions<VAPIDSecretOptions>
{
    private readonly IConfiguration configuration;

    public ConfigureVAPIDSecretOptions(IConfiguration configuration)
    {
        this.configuration = configuration;
    }

    public void Configure(VAPIDSecretOptions options)
    {
        if(configuration.GetSection("VAPID") is { } section && section.Exists())
        {
            if(section.GetValue<string>("PublicKey") is { } publicKey)
            {
                options.PublicKey = Encoders.FromBase64String(publicKey);
            }

            if(section.GetValue<string>("PrivateKey") is { } privateKey)
            {
                options.PrivateKey = Encoders.FromBase64String(privateKey);
            }
        }
    }
}
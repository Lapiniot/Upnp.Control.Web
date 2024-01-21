using Upnp.Control.Abstractions;

namespace Upnp.Control.Infrastructure.PushNotifications;

internal sealed class VAPIDKeyConfigInitializer(IHostEnvironment environment, IConfiguration configuration, IBase64UrlEncoder base64Encoder) : IServiceInitializer
{
    public Task InitializeAsync(CancellationToken cancellationToken)
    {
        var configDirectory = environment.GetAppConfigPath();
        Directory.CreateDirectory(configDirectory);
        return ConfigMigrations.EnsureVapidConfigExistsAsync(Path.Combine(configDirectory, "appsettings.Secrets.json"), configuration, base64Encoder);
    }
}
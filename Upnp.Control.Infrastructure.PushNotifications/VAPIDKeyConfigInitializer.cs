using Upnp.Control.Abstractions;

namespace Upnp.Control.Infrastructure.PushNotifications;

internal sealed class VAPIDKeyConfigInitializer(IHostEnvironment environment, IConfiguration configuration, IBase64UrlEncoder base64Encoder) : IServiceInitializer
{
    public Task InitializeAsync(CancellationToken cancellationToken)
    {
        var configRoot = Path.Combine(environment.ContentRootPath, "config");
        Directory.CreateDirectory(configRoot);
        return ConfigMigrations.EnsureVapidConfigExistsAsync(Path.Combine(configRoot, "appsettings.Secrets.json"), configuration, base64Encoder);
    }
}
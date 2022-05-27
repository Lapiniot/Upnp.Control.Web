using Upnp.Control.Abstractions;

namespace Upnp.Control.Infrastructure.PushNotifications;

internal sealed class VAPIDKeyConfigInitializer : IServiceInitializer
{
    private readonly IConfiguration configuration;
    private readonly IHostEnvironment environment;

    public VAPIDKeyConfigInitializer(IHostEnvironment environment, IConfiguration configuration)
    {
        this.environment = environment;
        this.configuration = configuration;
    }

    public Task InitializeAsync(CancellationToken cancellationToken)
    {
        var configRoot = Path.Combine(environment.ContentRootPath, "config");
        Directory.CreateDirectory(configRoot);
        return ConfigMigrations.EnsureVapidConfigExistsAsync(Path.Combine(configRoot, "appsettings.Secrets.json"), configuration);
    }
}
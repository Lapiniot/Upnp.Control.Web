using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Abstractions;

namespace Upnp.Control.Infrastructure.PushNotifications;

[SuppressMessage("Performance", "CA1812: Avoid uninstantiated internal classes", Justification = "Instantiated by DI container")]
internal class VAPIDKeyConfigInitializer : IServiceInitializer
{
    private readonly IHostEnvironment environment;
    private readonly IConfiguration configuration;

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
using Upnp.Control.Services;
using Web.Upnp.Control.Configuration;

namespace Web.Upnp.Control.Services;

public class ApplicationInitService : BackgroundService
{
    private readonly IServiceProvider services;
    private readonly IHostEnvironment environment;
    private readonly IConfiguration configuration;

    public ApplicationInitService(IServiceProvider services, IHostEnvironment environment, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(environment);
        ArgumentNullException.ThrowIfNull(configuration);

        this.services = services;
        this.environment = environment;
        this.configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        string root = environment.ContentRootPath;

        using var scope = services.CreateScope();
        await Task.WhenAll(scope.ServiceProvider.GetServices<IServiceInitializer>()
            .Select(initializer => initializer.InitializeAsync(stoppingToken))).ConfigureAwait(false);

        var configRoot = Path.Combine(root, "config");
        Directory.CreateDirectory(configRoot);
        await ConfigMigrations.EnsureVapidConfigExistsAsync(Path.Combine(configRoot, "appsettings.Secrets.json"), configuration).ConfigureAwait(false);
    }
}
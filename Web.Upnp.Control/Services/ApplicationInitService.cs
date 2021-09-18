using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.DataAccess;

namespace Web.Upnp.Control.Services;

public class ApplicationInitService : IHostedService
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

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        string root = environment.ContentRootPath;

        Directory.CreateDirectory(Path.Combine(root, "data"));
        await InitializeDatabasesAsync(cancellationToken).ConfigureAwait(false);

        var configRoot = Path.Combine(root, "config");
        Directory.CreateDirectory(configRoot);
        await ConfigMigrations.EnsureVapidConfigExistsAsync(Path.Combine(configRoot, "appsettings.Secrets.json"), configuration).ConfigureAwait(false);
    }

    private async Task InitializeDatabasesAsync(CancellationToken cancellationToken)
    {
        using var scope = services.CreateScope();
        var serviceProvider = scope.ServiceProvider;
        var upnpDb = serviceProvider.GetRequiredService<UpnpDbContext>();
        await upnpDb.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);
        var pushDb = serviceProvider.GetRequiredService<PushSubscriptionDbContext>();
        await pushDb.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
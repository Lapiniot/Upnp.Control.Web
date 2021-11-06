using Upnp.Control.Services;

namespace Upnp.Control.Infrastructure;

public class ApplicationInitService : BackgroundService
{
    private readonly IServiceProvider services;

    public ApplicationInitService(IServiceProvider services)
    {
        ArgumentNullException.ThrowIfNull(services);

        this.services = services;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = services.CreateScope();
        await Task.WhenAll(scope.ServiceProvider.GetServices<IServiceInitializer>()
            .Select(initializer => initializer.InitializeAsync(stoppingToken))).ConfigureAwait(false);
    }
}
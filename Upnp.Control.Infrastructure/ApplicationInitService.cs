using Upnp.Control.Abstractions;

namespace Upnp.Control.Infrastructure;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes: instantiated by DI container
internal sealed partial class ApplicationInitService : IHostedService
{
    private readonly IServiceProvider services;
    private readonly ILogger<ApplicationInitService> logger;

    public ApplicationInitService(IServiceProvider services, ILogger<ApplicationInitService> logger)
    {
        this.services = services;
        this.logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        LogStarted();

        using var scope = services.CreateScope();

        await Task.WhenAll(scope.ServiceProvider.GetServices<IServiceInitializer>()
            .Select(initializer =>
            {
                LogStartInit(initializer.GetType().Name);
                return initializer.InitializeAsync(cancellationToken);
            })).ConfigureAwait(false);

        LogDone();
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    [LoggerMessage(1, LogLevel.Information, $"Started {nameof(ApplicationInitService)} service")]
    private partial void LogStarted();

    [LoggerMessage(2, LogLevel.Information, "Starting '{initializerName}' initializer")]
    private partial void LogStartInit(string initializerName);

    [LoggerMessage(3, LogLevel.Information, "Initialization is done")]
    private partial void LogDone();
}
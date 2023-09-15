using Upnp.Control.Abstractions;

namespace Upnp.Control.Infrastructure;

internal sealed partial class ApplicationInitService(IServiceProvider services, ILogger<ApplicationInitService> logger) : IHostedService
{
    private readonly ILogger<ApplicationInitService> logger = logger;

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
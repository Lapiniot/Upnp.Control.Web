namespace Upnp.Control.Infrastructure;

public abstract partial class BackgroundServiceBase : BackgroundService
{
    private readonly ILogger<BackgroundServiceBase> logger;

    protected BackgroundServiceBase(ILogger<BackgroundServiceBase> logger)
    {
        this.logger = logger;
    }

    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        var name = GetType().Name;
        LogStarting(name);
        await base.StartAsync(cancellationToken).ConfigureAwait(false);
        LogStarted(GetType().Name);
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        var name = GetType().Name;
        LogStopping(name);
        await base.StopAsync(cancellationToken).ConfigureAwait(false);
        LogStopped(name);
    }

    [LoggerMessage(1, LogLevel.Information, "Starting {service} service...")]
    private partial void LogStarting(string service);

    [LoggerMessage(2, LogLevel.Information, "Started {service} service")]
    private partial void LogStarted(string service);

    [LoggerMessage(3, LogLevel.Information, "Stopping {service} service...")]
    private partial void LogStopping(string service);

    [LoggerMessage(4, LogLevel.Information, "Stopped {service} service")]
    private partial void LogStopped(string service);
}
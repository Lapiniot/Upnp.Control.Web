namespace Upnp.Control.DataAccess;

internal sealed class SqliteMigrateDbInitializer<TContext>(TContext context) : IServiceInitializer where TContext : DbContext
{
    public Task InitializeAsync(CancellationToken cancellationToken)
    {
        var path = context.Database.GetConnectionString()![12..^1];
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        return context.Database.MigrateAsync(cancellationToken);
    }
}
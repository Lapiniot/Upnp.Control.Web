namespace Upnp.Control.DataAccess;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class SqliteMigrateDbInitializer<TContext> : IServiceInitializer where TContext : DbContext
{
    private readonly TContext context;

    public SqliteMigrateDbInitializer(TContext context)
    {
        this.context = context;
    }

    public Task InitializeAsync(CancellationToken cancellationToken)
    {
        var path = context.Database.GetConnectionString()[12..^1];
        Directory.CreateDirectory(Path.GetDirectoryName(path));
        return context.Database.MigrateAsync(cancellationToken);
    }
}
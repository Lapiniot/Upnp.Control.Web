using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Upnp.Control.Services;

namespace Upnp.Control.DataAccess;

[SuppressMessage("Performance", "CA1812: Avoid uninstantiated internal classes", Justification = "Instantiated by DI container")]
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
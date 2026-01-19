using Microsoft.Data.Sqlite;
using OOs.Extensions.Hosting;

namespace Upnp.Control.DataAccess;

internal sealed class SqliteMigrateDbInitializer<TContext>(TContext context) : IServiceInitializer
    where TContext : DbContext
{
    public Task InitializeAsync(CancellationToken cancellationToken)
    {
        var connectionString = context.Database.GetConnectionString();
        var builder = new SqliteConnectionStringBuilder(connectionString);
        if (Path.GetDirectoryName(builder.DataSource) is { Length: > 0 } path)
        {
            Directory.CreateDirectory(path);
        }

        return context.Database.MigrateAsync(cancellationToken);
    }
}
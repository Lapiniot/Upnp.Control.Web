using Microsoft.EntityFrameworkCore.Design;

namespace Upnp.Control.DataAccess.Design;

internal abstract class SqliteDesignTimeDbContextFactory<TContext> : IDesignTimeDbContextFactory<TContext>
    where TContext : DbContext
{
    public TContext CreateDbContext(string[] args)
    {
        var builder = new DbContextOptionsBuilder<TContext>();
        OnConfigureOptions(builder);
        return Create(builder.Options);
    }

    protected virtual void OnConfigureOptions(DbContextOptionsBuilder<TContext> builder)
    {
        builder.UseSqlite("Data Source=db.db3;");
    }

    protected abstract TContext Create(DbContextOptions<TContext> options);
}
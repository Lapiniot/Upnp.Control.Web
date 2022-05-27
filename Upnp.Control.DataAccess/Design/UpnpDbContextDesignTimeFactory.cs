namespace Upnp.Control.DataAccess.Design;

internal sealed class UpnpDbContextDesignTimeFactory : SqliteDesignTimeDbContextFactory<UpnpDbContext>
{
    protected override UpnpDbContext Create(DbContextOptions<UpnpDbContext> options) => new(options);
}
namespace Upnp.Control.DataAccess.Design;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class UpnpDbContextDesignTimeFactory : SqliteDesignTimeDbContextFactory<UpnpDbContext>
{
    protected override UpnpDbContext Create(DbContextOptions<UpnpDbContext> options) => new(options);
}
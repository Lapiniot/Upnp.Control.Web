namespace Upnp.Control.DataAccess.Design;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class PushSubscriptionDbContextDesignTimeFactory : SqliteDesignTimeDbContextFactory<PushSubscriptionDbContext>
{
    protected override PushSubscriptionDbContext Create(DbContextOptions<PushSubscriptionDbContext> options) => new(options);
}
namespace Upnp.Control.DataAccess.Design;

internal sealed class PushSubscriptionDbContextDesignTimeFactory : SqliteDesignTimeDbContextFactory<PushSubscriptionDbContext>
{
    protected override PushSubscriptionDbContext Create(DbContextOptions<PushSubscriptionDbContext> options) => new(options);
}
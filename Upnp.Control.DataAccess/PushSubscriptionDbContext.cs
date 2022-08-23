using Upnp.Control.DataAccess.Configuration;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess;

internal sealed class PushSubscriptionDbContext : DbContext
{
    [DynamicDependency(PublicConstructors, typeof(PushNotificationSubscription))]
    public PushSubscriptionDbContext(DbContextOptions<PushSubscriptionDbContext> options) : base(options) { }

    public DbSet<PushNotificationSubscription> Subscriptions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfiguration(new PushSubscriptionEntityType());
}
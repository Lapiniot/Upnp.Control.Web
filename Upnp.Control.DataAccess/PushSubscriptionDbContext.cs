using Upnp.Control.DataAccess.Configuration;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess;

[method: DynamicDependency(PublicConstructors, typeof(PushNotificationSubscription))]
[method: UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode", Justification = "Preserved manually.")]
internal sealed class PushSubscriptionDbContext(DbContextOptions<PushSubscriptionDbContext> options) : DbContext(options)
{
    public DbSet<PushNotificationSubscription> Subscriptions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfiguration(new PushSubscriptionEntityType());
}
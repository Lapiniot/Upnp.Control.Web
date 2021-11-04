using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Upnp.Control.DataAccess.Configurations;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess;

internal sealed class PushSubscriptionDbContext : DbContext
{
    public PushSubscriptionDbContext(DbContextOptions<PushSubscriptionDbContext> options) : base(options) { }

    public DbSet<PushNotificationSubscription> Subscriptions { get; set; }

    [DynamicDependency("AddYears", typeof(DateOnly))]
    [DynamicDependency("AddMonths", typeof(DateOnly))]
    [DynamicDependency("AddDays", typeof(DateOnly))]
    protected override void OnModelCreating([NotNull] ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new PushSubscriptionEntityType());
    }
}
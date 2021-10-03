using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.DataAccess;

public class PushSubscriptionDbContext : DbContext
{
    public PushSubscriptionDbContext(DbContextOptions<PushSubscriptionDbContext> options) : base(options) { }

    public DbSet<PushNotificationSubscription> Subscriptions { get; set; }

    [DynamicDependency("AddYears", typeof(DateOnly))]
    [DynamicDependency("AddMonths", typeof(DateOnly))]
    [DynamicDependency("AddDays", typeof(DateOnly))]
    protected override void OnModelCreating([NotNull] ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new PushSubscriptionEntityTypeConfiguration());
    }
}
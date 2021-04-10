using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.DataAccess
{
    public class PushSubscriptionDbContext : DbContext
    {
        public PushSubscriptionDbContext(DbContextOptions<PushSubscriptionDbContext> options) : base(options) { }

        public DbSet<PushNotificationSubscription> Subscriptions { get; set; }

        [SuppressMessage("Microsoft.Design", "CA1062: Validate arguments of public methods")]
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new PushSubscriptionEntityTypeConfiguration());
        }
    }
}
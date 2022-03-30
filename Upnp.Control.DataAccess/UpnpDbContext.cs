using System.Diagnostics.CodeAnalysis;
using Upnp.Control.DataAccess.Configurations;

namespace Upnp.Control.DataAccess;

internal sealed class UpnpDbContext : DbContext
{
    public UpnpDbContext(DbContextOptions<UpnpDbContext> options) : base(options) { }

    public DbSet<UpnpDevice> UpnpDevices { get; set; }

    [DynamicDependency("AddYears", typeof(DateOnly))]
    [DynamicDependency("AddMonths", typeof(DateOnly))]
    [DynamicDependency("AddDays", typeof(DateOnly))]
    protected override void OnModelCreating(ModelBuilder modelBuilder) => modelBuilder.ApplyConfiguration(new DeviceEntityType());
}
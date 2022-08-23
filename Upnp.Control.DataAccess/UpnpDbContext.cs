using Upnp.Control.DataAccess.Configuration;

namespace Upnp.Control.DataAccess;

internal sealed class UpnpDbContext : DbContext
{
    [DynamicDependency(PublicConstructors, typeof(UpnpDbContext))]
    [DynamicDependency(PublicConstructors, typeof(Service))]
    [DynamicDependency(PublicConstructors, typeof(Icon))]
    private DbSet<UpnpDevice> upnpDevices;

    public UpnpDbContext(DbContextOptions<UpnpDbContext> options) : base(options) { }

    public DbSet<UpnpDevice> UpnpDevices { get => upnpDevices; set => upnpDevices = value; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) => modelBuilder.ApplyConfiguration(new DeviceEntityType());
}
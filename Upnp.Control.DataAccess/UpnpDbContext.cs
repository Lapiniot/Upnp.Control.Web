using Upnp.Control.DataAccess.Configuration;

namespace Upnp.Control.DataAccess;

internal sealed class UpnpDbContext : DbContext
{
    [DynamicDependency(PublicConstructors, typeof(UpnpDbContext))]
    [DynamicDependency(PublicConstructors, typeof(Service))]
    [DynamicDependency(PublicConstructors, typeof(Icon))]
    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode", Justification = "Preserved manually.")]
    public UpnpDbContext(DbContextOptions<UpnpDbContext> options) : base(options) { }

    public DbSet<UpnpDevice> UpnpDevices { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfiguration(new DeviceEntityType());
}
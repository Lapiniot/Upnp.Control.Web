using Upnp.Control.DataAccess.Configuration;

namespace Upnp.Control.DataAccess;

[method: DynamicDependency(PublicConstructors, typeof(UpnpDbContext))]
[method: DynamicDependency(PublicConstructors, typeof(Service))]
[method: DynamicDependency(PublicConstructors, typeof(Icon))]
[method: UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode", Justification = "Preserved manually.")]
internal sealed class UpnpDbContext(DbContextOptions<UpnpDbContext> options) : DbContext(options)
{
    public DbSet<UpnpDevice> UpnpDevices { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfiguration(new DeviceEntityType());
}
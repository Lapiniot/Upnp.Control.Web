using Upnp.Control.DataAccess.Configuration;

namespace Upnp.Control.DataAccess;

internal sealed class UpnpDbContext : DbContext
{
    public UpnpDbContext(DbContextOptions<UpnpDbContext> options) : base(options) { }

    public DbSet<UpnpDevice> UpnpDevices { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) => modelBuilder.ApplyConfiguration(new DeviceEntityType());
}
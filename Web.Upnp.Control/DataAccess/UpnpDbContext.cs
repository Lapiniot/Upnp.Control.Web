using Microsoft.EntityFrameworkCore;

namespace Web.Upnp.Control.DataAccess
{
    public class UpnpDbContext : DbContext
    {
        public UpnpDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<UpnpDevice> UpnpDevices { get; set; }
    }
}
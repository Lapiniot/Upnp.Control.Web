using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.DataAccess
{
    public class UpnpDbContext : DbContext
    {
        public UpnpDbContext(DbContextOptions options) : base(options) { }

        public DbSet<Device> UpnpDevices { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Device>().HasKey(d => d.Udn);
            modelBuilder.Entity<Icon>().HasKey("id");
            modelBuilder.Entity<Service>().HasKey("id");
        }
    }
}
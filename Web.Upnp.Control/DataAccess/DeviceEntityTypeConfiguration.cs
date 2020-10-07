using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.DataAccess
{
    public class DeviceEntityTypeConfiguration : IEntityTypeConfiguration<Device>
    {
        public void Configure(EntityTypeBuilder<Device> builder)
        {
            builder.HasKey(d => d.Udn);

            builder.OwnsMany(d => d.Icons, i =>
            {
                i.WithOwner().HasForeignKey("Udn");
                i.Property<int>("Id").ValueGeneratedOnAdd();
                i.HasKey("Id");
            });

            builder.OwnsMany(d => d.Services, s =>
            {
                s.WithOwner().HasForeignKey("Udn");
                s.Property<int>("Id").ValueGeneratedOnAdd();
                s.HasKey("Id");
            });
        }
    }
}
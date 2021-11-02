using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.DataAccess;

internal class DeviceEntityTypeConfiguration : IEntityTypeConfiguration<UpnpDevice>
{
    public void Configure(EntityTypeBuilder<UpnpDevice> builder)
    {
        _ = builder.HasKey(d => d.Udn);

        builder.OwnsMany(d => d.Icons, i =>
        {
            i.WithOwner().HasForeignKey("Udn");
            i.HasKey("Id");
        });

        builder.OwnsMany(d => d.Services, s =>
        {
            s.WithOwner().HasForeignKey("Udn");
            s.HasKey("Id");
        });
    }
}
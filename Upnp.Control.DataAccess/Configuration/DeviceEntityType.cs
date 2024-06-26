using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Upnp.Control.DataAccess.Configuration;

internal sealed class DeviceEntityType : IEntityTypeConfiguration<UpnpDevice>
{
    public void Configure(EntityTypeBuilder<UpnpDevice> builder)
    {
        builder.HasKey(d => d.Udn);

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
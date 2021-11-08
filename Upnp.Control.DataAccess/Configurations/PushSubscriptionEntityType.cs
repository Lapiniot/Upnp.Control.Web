using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Configurations;

internal sealed class PushSubscriptionEntityType : IEntityTypeConfiguration<PushNotificationSubscription>
{
    public void Configure(EntityTypeBuilder<PushNotificationSubscription> builder)
    {
        builder.HasKey(e => e.Endpoint);
        builder.Property(e => e.P256dhKey).IsRequired();
        builder.Property(e => e.AuthKey).IsRequired();
    }
}
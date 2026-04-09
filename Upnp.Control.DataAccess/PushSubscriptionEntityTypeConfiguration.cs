using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess;

internal sealed class PushSubscriptionEntityTypeConfiguration : IEntityTypeConfiguration<PushNotificationSubscription>
{
    public void Configure(EntityTypeBuilder<PushNotificationSubscription> builder)
    {
        builder.HasKey(e => e.Endpoint);
        builder.Property(e => e.P256dhKey).IsRequired();
        builder.Property(e => e.AuthKey).IsRequired();
    }
}
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.DataAccess;

internal class PushSubscriptionEntityTypeConfiguration : IEntityTypeConfiguration<PushNotificationSubscription>
{
    public void Configure(EntityTypeBuilder<PushNotificationSubscription> builder)
    {
        builder.HasKey(new[] { nameof(PushNotificationSubscription.Endpoint), nameof(PushNotificationSubscription.Type) });
        builder.Property(e => e.P256dhKey).IsRequired();
        builder.Property(e => e.AuthKey).IsRequired();
    }
}
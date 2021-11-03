using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;

namespace Upnp.Control.DataAccess.Design;

[SuppressMessage("Performance", "CA1812: Avoid uninstantiated internal classes", Justification = "Instantiated by DI container")]
internal sealed class PushSubscriptionDbContextDesignTimeFactory : SqliteDesignTimeDbContextFactory<PushSubscriptionDbContext>
{
    protected override PushSubscriptionDbContext Create(DbContextOptions<PushSubscriptionDbContext> options)
    {
        return new PushSubscriptionDbContext(options);
    }
}
using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;

namespace Upnp.Control.DataAccess.Design;

[SuppressMessage("Performance", "CA1812: Avoid uninstantiated internal classes", Justification = "Instantiated by DI container")]
internal sealed class UpnpDbContextDesignTimeFactory : SqliteDesignTimeDbContextFactory<UpnpDbContext>
{
    protected override UpnpDbContext Create(DbContextOptions<UpnpDbContext> options)
    {
        return new UpnpDbContext(options);
    }
}
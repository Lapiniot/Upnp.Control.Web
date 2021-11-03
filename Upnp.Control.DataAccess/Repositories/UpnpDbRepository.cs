using System.Diagnostics.CodeAnalysis;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using Upnp.Control.Models;
using Upnp.Control.Services;

namespace Upnp.Control.DataAccess.Repositories;

[SuppressMessage("Performance", "CA1812: Avoid uninstantiated internal classes", Justification = "Instantiated by DI container")]
internal sealed class UpnpDbRepository : IUpnpDeviceRepository
{
    private readonly UpnpDbContext context;

    public UpnpDbRepository(UpnpDbContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        this.context = context;
    }

    public Task AddAsync(UpnpDevice device, CancellationToken cancellationToken)
    {
        context.Add(device);
        return context.SaveChangesAsync(cancellationToken);
    }

    public async IAsyncEnumerable<UpnpDevice> EnumerateAsync(Expression<Func<UpnpDevice, bool>> filter, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var queryable = filter is not null ? CreateBaseQuery().Where(filter) : CreateBaseQuery();

        await foreach(var device in queryable.AsAsyncEnumerable().WithCancellation(cancellationToken))
        {
            yield return device;
        }
    }

    public Task<UpnpDevice> FindAsync(string udn, CancellationToken cancellationToken)
    {
        return CreateBaseQuery().Where(d => d.Udn == udn).FirstOrDefaultAsync(cancellationToken);
    }

    public Task RemoveAsync(UpnpDevice device, CancellationToken cancellationToken)
    {
        context.Remove(device);
        return context.SaveChangesAsync(cancellationToken);
    }

    public Task UpdateExpirationAsync(UpnpDevice device, DateTime value, CancellationToken cancellationToken)
    {
        context.Entry(device).Property(d => d.ExpiresAt).CurrentValue = value;
        return context.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<UpnpDevice> CreateBaseQuery()
    {
        return context.UpnpDevices.AsNoTracking().Include(d => d.Icons).Include(d => d.Services).Where(d => d.ExpiresAt > DateTime.UtcNow);
    }
}
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
        this.context = context;
    }

    public Task AddAsync(UpnpDevice device, CancellationToken cancellationToken)
    {
        context.Add(device);
        return context.SaveChangesAsync(cancellationToken);
    }

    public async IAsyncEnumerable<UpnpDevice> EnumerateAsync(Expression<Func<UpnpDevice, bool>> filter, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var queryable = context.UpnpDevices.AsNoTracking();

        if(filter is not null)
        {
            queryable = queryable.Where(filter);
        }

        await foreach(var device in queryable.AsAsyncEnumerable().WithCancellation(cancellationToken).ConfigureAwait(false))
        {
            yield return device;
        }
    }

    public async Task<UpnpDevice> FindAsync(string udn, CancellationToken cancellationToken)
    {
        return await context.UpnpDevices.FindAsync(new object[] { udn }, cancellationToken).ConfigureAwait(false);
    }

    public Task PatchAsync<T>(UpnpDevice device, Expression<Func<UpnpDevice, T>> accessor, T value, CancellationToken cancellationToken)
    {
        context.Entry(device).Property(accessor).CurrentValue = value;
        return context.SaveChangesAsync(cancellationToken);
    }

    public async Task<UpnpDevice> TryRemoveAsync(string udn, CancellationToken cancellationToken)
    {
        var entity = await context.UpnpDevices.FindAsync(new object[] { udn }, cancellationToken).ConfigureAwait(false);
        if(entity is not null)
        {

            context.Remove(entity);
            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
        return entity;
    }
}
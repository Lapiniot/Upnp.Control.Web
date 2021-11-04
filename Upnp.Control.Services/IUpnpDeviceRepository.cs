using System.Linq.Expressions;
using Upnp.Control.Models;

namespace Upnp.Control.Services;

public interface IUpnpDeviceRepository
{
    IAsyncEnumerable<UpnpDevice> EnumerateAsync(Expression<Func<UpnpDevice, bool>> filter, CancellationToken cancellationToken);
    Task<UpnpDevice> FindAsync(string udn, CancellationToken cancellationToken);
    Task<UpnpDevice> TryRemoveAsync(string udn, CancellationToken cancellationToken);
    Task AddAsync(UpnpDevice device, CancellationToken cancellationToken);
    Task PatchAsync<T>(UpnpDevice device, Expression<Func<UpnpDevice, T>> accessor, T value, CancellationToken cancellationToken);
}
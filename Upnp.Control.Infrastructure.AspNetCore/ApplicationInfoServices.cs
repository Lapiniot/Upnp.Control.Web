using System.Net;
using System.Reflection;
using static System.Net.Sockets.AddressFamily;

namespace Upnp.Control.Infrastructure.AspNetCore;

internal sealed record ApplicationInfo(string? Version, string? Product, string HostName, IEnumerable<string> Addresses);

internal static class ApplicationInfoServices
{
    private static readonly string? Version = Assembly.GetEntryAssembly()?
        .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
        .InformationalVersion;

    private static readonly string? Product = Assembly.GetEntryAssembly()?
        .GetCustomAttribute<AssemblyProductAttribute>()?
        .Product;

    public static async Task<IResult> GetApplicationInfoAsync(CancellationToken cancellationToken)
    {
        var hostName = Dns.GetHostName();
        return Results.Json(new ApplicationInfo(Version, Product, hostName,
            (await Dns.GetHostAddressesAsync(hostName, InterNetwork, cancellationToken).ConfigureAwait(false))
                .Where(ip => ip is { AddressFamily: InterNetwork } && !IPAddress.IsLoopback(ip))
                .Select(ip => ip.ToString())));
    }
}
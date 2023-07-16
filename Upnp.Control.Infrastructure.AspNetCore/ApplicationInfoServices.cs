using System.Net;
using System.Reflection;
using Microsoft.AspNetCore.Http.HttpResults;
using static System.Net.Sockets.AddressFamily;

namespace Upnp.Control.Infrastructure.AspNetCore;

public record ApplicationInfo(BuildInfo Build, string? Product, string HostName, IEnumerable<string> Addresses);

public record struct BuildInfo(string? Version, string? Date);

internal static class ApplicationInfoServices
{
    private static readonly BuildInfo Build = GetBuildInfo();

    private static readonly string? Product = Assembly.GetEntryAssembly()?
        .GetCustomAttribute<AssemblyProductAttribute>()?
        .Product;

    public static async Task<Ok<ApplicationInfo>> GetApplicationInfoAsync(CancellationToken cancellationToken)
    {
        var hostName = Dns.GetHostName();
        var hostAddresses = await Dns.GetHostAddressesAsync(hostName, InterNetwork, cancellationToken).ConfigureAwait(false);
        var addresses = hostAddresses.Where(static ip => ip is { AddressFamily: InterNetwork } && !IPAddress.IsLoopback(ip)).Select(ip => ip.ToString());
        return TypedResults.Ok(new ApplicationInfo(Build, Product, hostName, addresses));
    }

    private static BuildInfo GetBuildInfo()
    {
        var version = Assembly.GetEntryAssembly()!
            .GetCustomAttribute<AssemblyInformationalVersionAttribute>()!
            .InformationalVersion;
        var index = version!.IndexOf("+build", 0, StringComparison.OrdinalIgnoreCase);
        return index > 0 ? new(version[..index], version[(index + 6)..]) : new(version, null);
    }
}
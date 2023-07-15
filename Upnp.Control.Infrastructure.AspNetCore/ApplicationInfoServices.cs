using System.Net;
using System.Reflection;
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

    public static async Task<ApplicationInfo> GetApplicationInfoAsync(CancellationToken cancellationToken)
    {
        var hostName = Dns.GetHostName();
        return new(Build, Product, hostName,
            (await Dns.GetHostAddressesAsync(hostName, InterNetwork, cancellationToken).ConfigureAwait(false))
                .Where(ip => ip is { AddressFamily: InterNetwork } && !IPAddress.IsLoopback(ip))
                .Select(ip => ip.ToString()));
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
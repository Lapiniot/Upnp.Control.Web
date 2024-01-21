using static System.Environment;

namespace Upnp.Control.Infrastructure;

public static class EnvironmentExtensions
{
    public static string GetAppDataPath(this IHostEnvironment environment)
    {
        ArgumentNullException.ThrowIfNull(environment);
        return Path.Combine(GetFolderPath(SpecialFolder.LocalApplicationData, SpecialFolderOption.DoNotVerify), environment.ApplicationName);
    }

    public static string GetAppConfigPath(this IHostEnvironment environment)
    {
        ArgumentNullException.ThrowIfNull(environment);
        return Path.Combine(GetFolderPath(SpecialFolder.ApplicationData, SpecialFolderOption.DoNotVerify), environment.ApplicationName);
    }
}
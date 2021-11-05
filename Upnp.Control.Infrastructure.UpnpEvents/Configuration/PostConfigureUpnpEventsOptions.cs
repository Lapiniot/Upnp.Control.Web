using System.Diagnostics.CodeAnalysis;

namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

[SuppressMessage("Performance", "CA1812: Avoid uninstantiated internal classes", Justification = "Instantiated by DI container")]
internal class PostConfigureUpnpEventsOptions : IPostConfigureOptions<UpnpEventsOptions>
{
    public void PostConfigure(string name, UpnpEventsOptions options)
    {
        foreach(var key in options.CallbackMappings.Keys.Where(key => key.Contains('_', StringComparison.Ordinal)).ToList())
        {
            options.CallbackMappings.Remove(key, out var value);
            options.CallbackMappings[key.Replace('_', ':')] = value;
        }
    }
}
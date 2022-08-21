using Upnp.Control.Infrastructure.Configuration;

namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

internal sealed class UpnpEventsOptionsBinder : OptionsBinder<UpnpEventsOptions>
{
    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode")]
    public override void Bind(UpnpEventsOptions options, IConfiguration configuration)
    {
        var timeout = configuration.GetSection(nameof(UpnpEventsOptions.SessionTimeout));
        if (timeout.Exists())
        {
            options.SessionTimeout = timeout.Get<TimeSpan>();
        }

        var mappings = configuration.GetSection(nameof(UpnpEventsOptions.CallbackMappings));
        if (!mappings.Exists()) return;
        foreach (var mapping in mappings.GetChildren())
        {
            foreach (var node in mapping.TraverseTreeDeep())
            {
                if (node.Value is null) continue;
                var start = mappings.Path.Length + 1;
                options.CallbackMappings[node.Path[start..]] = node.Value;
            }
        }
    }
}
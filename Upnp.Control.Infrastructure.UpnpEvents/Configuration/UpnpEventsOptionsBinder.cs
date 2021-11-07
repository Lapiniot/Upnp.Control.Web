using Upnp.Control.Infrastructure.Configuration;

namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

internal class UpnpEventsOptionsBinder : OptionsBinder<UpnpEventsOptions>
{
    public UpnpEventsOptionsBinder()
    {
    }

    public override void Bind(UpnpEventsOptions options, IConfiguration configuration)
    {
        var timeout = configuration.GetSection(nameof(UpnpEventsOptions.SessionTimeout));
        if(timeout.Exists())
        {
            options.SessionTimeout = timeout.Get<TimeSpan>();
        }

        var mappings = configuration.GetSection(nameof(UpnpEventsOptions.CallbackMappings));
        if(mappings.Exists())
        {
            int start = mappings.Path.Length + 1;
            foreach(var mapping in mappings.GetChildren())
            {
                foreach(var node in ConfigurationSectionExtensions.TraverseTreeDeep(mapping))
                {
                    if(node.Value is not null)
                    {
                        options.CallbackMappings[node.Path[start..]] = node.Value;
                    }
                }
            }
        }
    }
}
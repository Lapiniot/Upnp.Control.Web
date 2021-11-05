namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

#pragma warning disable CA1054

public static class UpnpEventsOptionsConfigureExtensions
{
    public static UpnpEventsOptions Map(this UpnpEventsOptions options, string serviceType, string callbackUrlTemplate)
    {
        ArgumentNullException.ThrowIfNull(options);

        if(string.IsNullOrEmpty(serviceType))
        {
            throw new ArgumentException($"'{nameof(serviceType)}' cannot be null or empty.", nameof(serviceType));
        }

        if(string.IsNullOrEmpty(callbackUrlTemplate))
        {
            throw new ArgumentException($"'{nameof(callbackUrlTemplate)}' cannot be null or empty.", nameof(callbackUrlTemplate));
        }

        options.CallbackMappings[serviceType] = callbackUrlTemplate;
        return options;
    }
}
namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

public static class UpnpEventsOptionsConfigureExtensions
{
    public static UpnpEventsOptions Map(this UpnpEventsOptions options, string serviceType, string callbackTemplate)
    {
        ArgumentNullException.ThrowIfNull(options);

        if(string.IsNullOrEmpty(serviceType))
        {
            throw new ArgumentException($"'{nameof(serviceType)}' cannot be null or empty.", nameof(serviceType));
        }

        if(string.IsNullOrEmpty(callbackTemplate))
        {
            throw new ArgumentException($"'{nameof(callbackTemplate)}' cannot be null or empty.", nameof(callbackTemplate));
        }

        options.CallbackMappings[serviceType] = callbackTemplate;
        return options;
    }

    public static UpnpEventsOptions MapRenderingControl(this UpnpEventsOptions options, string callbackTemplate)
    {
        return options.Map(UpnpServices.RenderingControl, callbackTemplate);
    }

    public static UpnpEventsOptions MapAVTransport(this UpnpEventsOptions options, string callbackTemplate)
    {
        return options.Map(UpnpServices.AVTransport, callbackTemplate);
    }

    public static UpnpEventsOptions MapContentDirectory(this UpnpEventsOptions options, string callbackTemplate)
    {
        return options.Map(UpnpServices.ContentDirectory, callbackTemplate);
    }
}
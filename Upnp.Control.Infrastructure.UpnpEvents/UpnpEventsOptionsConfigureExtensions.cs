namespace Upnp.Control.Infrastructure.UpnpEvents;

public static class UpnpEventsOptionsConfigureExtensions
{
    extension(UpnpEventsOptions options)
    {
        public UpnpEventsOptions Map(string serviceType, string callbackTemplate)
        {
            ArgumentNullException.ThrowIfNull(options);

            if (string.IsNullOrEmpty(serviceType))
            {
                throw new ArgumentException($"'{nameof(serviceType)}' cannot be null or empty.", nameof(serviceType));
            }

            if (string.IsNullOrEmpty(callbackTemplate))
            {
                throw new ArgumentException($"'{nameof(callbackTemplate)}' cannot be null or empty.", nameof(callbackTemplate));
            }

            options.CallbackMappings[serviceType] = callbackTemplate;
            return options;
        }

        public UpnpEventsOptions MapRenderingControl(string callbackTemplate) =>
            options.Map(UpnpServices.RenderingControl, callbackTemplate);

        public UpnpEventsOptions MapAVTransport(string callbackTemplate) =>
            options.Map(UpnpServices.AVTransport, callbackTemplate);

        public UpnpEventsOptions MapContentDirectory(string callbackTemplate) =>
            options.Map(UpnpServices.ContentDirectory, callbackTemplate);
    }
}
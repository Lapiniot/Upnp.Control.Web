using System.Xml;

namespace Upnp.Control.Infrastructure.UpnpEvents;

internal abstract partial class PropChangedUpnpEventCommandHandler<TEvent> : IAsyncCommandHandler<NotifyPropChangedCommand<TEvent>>
    where TEvent : PropChangedEvent, new()
{
    private readonly ILogger logger;
    private readonly IEnumerable<IObserver<TEvent>> eventObservers;
    private readonly IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler;
    private readonly XmlReaderSettings settings = new() { Async = true, IgnoreComments = true, IgnoreWhitespace = true };

    protected PropChangedUpnpEventCommandHandler(IEnumerable<IObserver<TEvent>> eventObservers,
        IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler, ILogger logger)
    {
        this.eventObservers = eventObservers;
        this.handler = handler;
        this.logger = logger;
    }

    public async Task ExecuteAsync(NotifyPropChangedCommand<TEvent> command, CancellationToken cancellationToken)
    {
        IReadOnlyDictionary<string, string> properties;
        IReadOnlyDictionary<string, string> vendorProperties;

        using (var reader = XmlReader.Create(command.Content, settings))
        {
            (_, properties, vendorProperties) = await EventMessageXmlReader.ReadAsync(reader).ConfigureAwait(false);
        }

        if (properties == null || properties.Count == 0)
        {
            return;
        }

        var vt = NotifyObserversAsync(eventObservers, command.DeviceId, properties, vendorProperties, cancellationToken);
        if (!vt.IsCompletedSuccessfully)
        {
            await vt.ConfigureAwait(false);
        }
    }

    protected virtual async ValueTask NotifyObserversAsync(IEnumerable<IObserver<TEvent>> observers, string deviceId,
        IReadOnlyDictionary<string, string> properties, IReadOnlyDictionary<string, string> vendorProperties,
        CancellationToken cancellationToken)
    {
        var device = await handler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);

        var @event = new TEvent
        {
            Device = new(device.Udn, device.FriendlyName, device.Description),
            Properties = properties,
            VendorProperties = vendorProperties
        };

        foreach (var observer in observers)
        {
            try
            {
                observer.OnNext(@event);
            }
#pragma warning disable CA1031 // Do not catch general exception types: by design
            catch (Exception exception)
#pragma warning restore CA1031
            {
                LogError(exception, observer);
            }
        }
    }

    [LoggerMessage(1, LogLevel.Error, "Error sending UPnP event notification to observer {observer}")]
    private partial void LogError(Exception exception, IObserver<TEvent> observer);
}
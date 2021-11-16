using System.Xml;

namespace Upnp.Control.Infrastructure.UpnpEvents;

#pragma warning disable CA1812 // instantiated by DI container
internal partial class PropChangedUpnpEventCommandHandler<TEvent> : IAsyncCommandHandler<PropChangedUpnpEventCommand<TEvent>>
    where TEvent : PropChangedUpnpEvent, new()
{
    private readonly ILogger<PropChangedUpnpEventCommandHandler<TEvent>> logger;
    private readonly IEnumerable<IObserver<UpnpEvent>> observers;
    private readonly IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler;
    private readonly XmlReaderSettings settings = new() { Async = true, IgnoreComments = true, IgnoreWhitespace = true };

    public PropChangedUpnpEventCommandHandler(IEnumerable<IObserver<UpnpEvent>> observers,
        IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler,
        ILogger<PropChangedUpnpEventCommandHandler<TEvent>> logger)
    {
        this.observers = observers;
        this.handler = handler;
        this.logger = logger;
    }

    public async Task ExecuteAsync(PropChangedUpnpEventCommand<TEvent> command, CancellationToken cancellationToken)
    {
        IReadOnlyDictionary<string, string> properties;
        IReadOnlyDictionary<string, string> vendorProperties;

        using(var reader = XmlReader.Create(command.Stream, settings))
        {
            (_, properties, vendorProperties) = await EventMessageXmlReader.ReadAsync(reader).ConfigureAwait(false);
        }

        if(properties == null || properties.Count == 0)
        {
            return;
        }

        var vt = NotifyObserversAsync(observers, command.DeviceId, properties, vendorProperties, cancellationToken);
        if(!vt.IsCompletedSuccessfully)
        {
            await vt.ConfigureAwait(false);
        }
    }

    protected virtual async ValueTask NotifyObserversAsync(IEnumerable<IObserver<UpnpEvent>> observers, string deviceId,
        IReadOnlyDictionary<string, string> properties, IReadOnlyDictionary<string, string> vendorProperties,
        CancellationToken cancellationToken)
    {
        var device = await handler.ExecuteAsync(new GetDeviceQuery(deviceId), cancellationToken).ConfigureAwait(false);

        var @event = new TEvent()
        {
            Device = new DeviceDescription(device.Udn, device.FriendlyName, device.Description),
            Properties = properties,
            VendorProperties = vendorProperties
        };

        foreach(var observer in observers)
        {
            try
            {
                observer.OnNext(@event);
            }
#pragma warning disable CA1031 // Do not catch general exception types: by design
            catch(Exception exception)
#pragma warning restore CA1031
            {
                LogError(exception, observer);
            }
        }
    }

    [LoggerMessage(1, LogLevel.Error, "Error sending UPnP event notification to observer {observer}")]
    private partial void LogError(Exception exception, IObserver<UpnpEvent> observer);
}
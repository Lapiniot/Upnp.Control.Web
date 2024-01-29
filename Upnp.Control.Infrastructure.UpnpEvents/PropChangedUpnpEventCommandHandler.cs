using System.Xml;

namespace Upnp.Control.Infrastructure.UpnpEvents;

internal abstract partial class PropChangedUpnpEventCommandHandler<TCommand, TEvent>(IEnumerable<IObserver<TEvent>> eventObservers,
    IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler, ILogger logger) : IAsyncCommandHandler<TCommand>
    where TCommand : NotifyPropChangedCommand
    where TEvent : PropChangedEvent, new()
{
#pragma warning disable CA1823 // Avoid unused private fields
    private readonly ILogger logger = logger;
#pragma warning restore CA1823 // Avoid unused private fields
    private readonly XmlReaderSettings settings = new() { Async = true, IgnoreComments = true, IgnoreWhitespace = true };

    public async Task ExecuteAsync(TCommand command, CancellationToken cancellationToken)
    {
        IReadOnlyDictionary<string, string> properties;
        IReadOnlyDictionary<string, string> vendorProperties;

        LogCallbackEvent(command.DeviceId);

        using (var reader = XmlReader.Create(command.Content, settings))
        {
            (_, properties, vendorProperties) = await EventMessageXmlReader.ReadAsync(reader).ConfigureAwait(false);
        }

        if (properties == null || properties.Count == 0)
        {
            return;
        }

        await NotifyObserversAsync(eventObservers, command.DeviceId, properties, vendorProperties, cancellationToken).ConfigureAwait(false);
    }

    protected virtual async ValueTask NotifyObserversAsync(IEnumerable<IObserver<TEvent>> observers, string deviceId,
        IReadOnlyDictionary<string, string> properties, IReadOnlyDictionary<string, string> vendorProperties,
        CancellationToken cancellationToken)
    {
        var device = await handler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);

        var e = new TEvent
        {
            Device = new(device.Udn, device.FriendlyName, device.Description),
            Properties = properties,
            VendorProperties = vendorProperties
        };

        foreach (var observer in observers)
        {
            try
            {
                observer.OnNext(e);
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

    [LoggerMessage(2, LogLevel.Debug, "UPnP event from '{deviceId}'")]
    private partial void LogCallbackEvent(string deviceId);
}
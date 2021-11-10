using System.Xml;

namespace Upnp.Control.Infrastructure.UpnpEvents;

#pragma warning disable CA1812 // instantiated by DI container
internal partial class PropChangedUpnpEventCommandHandler<TEvent> : IAsyncCommandHandler<PropChangedUpnpEventCommand<TEvent>>
    where TEvent : PropChangedUpnpEvent, new()
{
    private readonly ILogger<PropChangedUpnpEventCommandHandler<TEvent>> logger;
    private readonly IEnumerable<IObserver<UpnpEvent>> observers;
    private readonly XmlReaderSettings settings = new() { Async = true, IgnoreComments = true, IgnoreWhitespace = true };

    public PropChangedUpnpEventCommandHandler(IEnumerable<IObserver<UpnpEvent>> observers, ILogger<PropChangedUpnpEventCommandHandler<TEvent>> logger)
    {
        this.observers = observers;
        this.logger = logger;
    }

    public async Task ExecuteAsync(PropChangedUpnpEventCommand<TEvent> command, CancellationToken cancellationToken)
    {
        IReadOnlyDictionary<string, string> properties;
        IReadOnlyDictionary<string, string> vendorProperties;

        using(var reader = XmlReader.Create(command.Stream, settings))
        {
            (_, properties, vendorProperties) = await EventMessageParser.ParseAsync(reader).ConfigureAwait(false);
        }

        if(properties == null || properties.Count == 0)
        {
            return;
        }

        var @event = new TEvent() { DeviceId = command.DeviceId, Properties = properties, VendorProperties = vendorProperties };

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
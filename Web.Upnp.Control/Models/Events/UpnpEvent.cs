using System.Collections.Generic;

namespace Web.Upnp.Control.Models.Events
{
    public abstract record UpnpEvent
    {
        public string DeviceId { get; init; }
    }

    public record UpnpPropertyChangedEvent : UpnpEvent
    {
        public IReadOnlyDictionary<string, string> Properties { get; init; }
        public IReadOnlyDictionary<string, string> VendorProperties { get; init; }
    }

    public record UpnpAVTransportPropertyChangedEvent : UpnpPropertyChangedEvent {}

    public record UpnpRenderingControlPropertyChangedEvent : UpnpPropertyChangedEvent {}
}
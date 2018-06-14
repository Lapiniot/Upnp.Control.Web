using System;

namespace Web.Upnp.Control.Models
{
    public class UpnpDevice
    {
        public UpnpDevice(string usn, Uri descriptionUri)
        {
            this.DescriptionUri = descriptionUri;
            Usn = usn;
        }
        public Uri DescriptionUri { get; }

        public string Usn { get; }
        public string DeviceType { get; internal set; }
        public string Name { get; internal set; }
        public string Manufacturer { get; internal set; }
        public string Description { get; internal set; }
        public string ModelName { get; internal set; }
        public string ModelNumber { get; internal set; }
    }
}
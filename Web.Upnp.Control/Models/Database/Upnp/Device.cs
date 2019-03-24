using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Web.Upnp.Control.Models.Database.Upnp
{
    public class Device
    {
        [Key]
        public string Udn { get; set; }

        public string Location { get; set; }

        public string DeviceType { get; set; }

        public string FriendlyName { get; set; }

        public string Manufacturer { get; set; }

        public string Description { get; set; }

        public string ModelName { get; set; }

        public string ModelNumber { get; set; }

        public List<Icon> Icons { get; set; }

        public List<Service> Services { get; set; }

        public bool IsOnline { get; set; }
    }
}
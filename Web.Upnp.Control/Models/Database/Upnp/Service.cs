namespace Web.Upnp.Control.Models.Database.Upnp
{
    public class Service
    {
        public int Id { get; set; }

        public string ServiceId { get; set; }

        public string MetadataUrl { get; set; }

        public string ServiceType { get; set; }

        public string ControlUrl { get; set; }
    }
}
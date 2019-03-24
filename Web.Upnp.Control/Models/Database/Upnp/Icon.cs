using System.Runtime.Serialization;

namespace Web.Upnp.Control.Models.Database.Upnp
{
    public class Icon
    {
        [IgnoreDataMember]
        public int Id { get; set; }

        public int Width { get; set; }

        public int Height { get; set; }

        public string Url { get; set; }

        public string Mime { get; set; }
    }
}
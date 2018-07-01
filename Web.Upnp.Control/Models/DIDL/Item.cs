using System.Collections.Generic;
using System.Xml;

namespace Web.Upnp.Control.Models.DIDL
{
    public abstract class Item
    {
        protected Item(string id, string parentId, bool restricted)
        {
            Id = id;
            ParentId = parentId;
            Restricted = restricted;
            Vendor = new Dictionary<string, string>();
        }

        public string Id { get; set; }
        public string ParentId { get; set; }
        public bool Restricted { get; set; }
        public string Title { get; set; }
        public Dictionary<string, string> Vendor { get; set; }
        public string Class { get; set; }
        public int? ChildCount { get; set; }
        public int? StorageUsed { get; set; }
        public Resource Resource { get; set; }
        public virtual bool TryReadProperty(XmlReader reader)
        {
            return false;
        }
    }
}
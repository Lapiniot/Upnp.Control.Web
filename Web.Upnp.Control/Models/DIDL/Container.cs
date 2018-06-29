using System.Collections.Generic;

namespace Web.Upnp.Control.Models.DIDL
{
    public class Container : Item
    {
        public Container(string id, string parentId, bool restricted, bool searchable) : base(id, parentId, restricted)
        {
            Searchable = searchable;
            Vendor = new Dictionary<string, string>();
        }

        public Dictionary<string, string> Vendor { get; set; }

        public bool Searchable { get; set; }

        public string Class { get; set; }

        public int? ChildCount { get; set; }

        public int? StorageUsed { get; set; }

        public Resource Resource { get; set; }
    }
}
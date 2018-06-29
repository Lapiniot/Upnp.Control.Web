using System.Collections.Generic;

namespace Web.Upnp.Control.Models.DIDL
{
    public class Container
    {
        public Container(string id, string parentId, bool restricted, bool searchable)
        {
            Id = id;
            ParentId = parentId;
            Restricted = restricted;
            Searchable = searchable;
            Vendor = new Dictionary<string, string>();
        }

        public Dictionary<string, string> Vendor { get; set; }

        public string Id { get; set; }

        public string ParentId { get; set; }

        public bool Restricted { get; set; }

        public bool Searchable { get; set; }

        public string Title { get; set; }

        public string Class { get; set; }

        public int? ChildCount { get; set; }

        public int? StorageUsed { get; set; }
    }
}
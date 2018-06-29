namespace Web.Upnp.Control.Models.DIDL
{
    public abstract class Item
    {
        protected Item(string id, string parentId, bool restricted)
        {
            Id = id;
            ParentId = parentId;
            Restricted = restricted;
        }

        public string Id { get; set; }
        public string ParentId { get; set; }
        public bool Restricted { get; set; }
        public string Title { get; set; }
    }
}
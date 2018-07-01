namespace Web.Upnp.Control.Models.DIDL
{
    public class Container : Item
    {
        public Container(string id, string parentId, bool restricted, bool searchable) : base(id, parentId, restricted)
        {
            Searchable = searchable;
        }

        public bool Searchable { get; set; }
    }
}
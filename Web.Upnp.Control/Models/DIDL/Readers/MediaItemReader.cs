namespace Web.Upnp.Control.Models.DIDL.Readers
{
    public class MediaItemReader : ItemReader<MediaItem>
    {
        private static MediaItemReader instance;

        public static MediaItemReader Instance
        {
            get { return instance ?? (instance = new MediaItemReader()); }
        }

        #region Overrides of ItemReader<MediaItem>

        protected override MediaItem CreateElement(string id, string parentId, bool restricted)
        {
            return new MediaItem(id, parentId, restricted);
        }

        #endregion
    }
}
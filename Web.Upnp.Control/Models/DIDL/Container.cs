using System;
using System.Collections.Generic;

namespace Web.Upnp.Control.Models.DIDL
{
    public class Container : Item
    {
        public Container(string id, string parentId, bool restricted) : base(id, parentId, restricted)
        {
        }

        public bool Searchable { get; set; }
        public string Description { get; set; }
        public string Creator { get; set; }
        public List<string> Artists { get; set; }
        public List<string> Actors { get; set; }
        public List<string> Authors { get; set; }
        public List<string> Producers { get; set; }
        public List<string> Publishers { get; set; }
        public List<string> Genres { get; set; }
        public List<string> AlbumArts { get; set; }
        public string Album { get; set; }
        public string Genre { get; set; }
        public DateTime? Date { get; set; }
        public int? ChildCount { get; set; }
        public int? ChildContainerCount { get; set; }
        public int? TrackNumber { get; set; }
        public string DiscographyUri { get; set; }
        public string LyricsUri { get; set; }
    }
}
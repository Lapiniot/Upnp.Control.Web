using System.Collections.Generic;
using System.Xml;
using static System.Xml.XmlNodeType;

namespace Web.Upnp.Control.Models.DIDL.Readers
{
    public class ContainerItemReader : ItemReader<Container>
    {
        private static ContainerItemReader instance;

        public static ContainerItemReader Instance
        {
            get { return instance ?? (instance = new ContainerItemReader()); }
        }

        protected override Container CreateElement(string id, string parentId, bool restricted)
        {
            return new Container(id, parentId, restricted);
        }

        protected override Container CreateElement(XmlReader reader)
        {
            var container = base.CreateElement(reader);

            container.Searchable = ParseBoolean(reader.GetAttribute("searchable"));
            container.ChildCount = ParseInt(reader.GetAttribute("childCount"));
            container.ChildContainerCount = ParseInt(reader.GetAttribute("childContainerCount"));

            return container;
        }

        #region Overrides of ItemReader<Container>

        protected override bool TryReadChildNode(XmlReader reader, Container element)
        {
            string ReadContentString()
            {
                return reader.ReadElementContentAsString();
            }

            if(reader.NodeType == Element)
            {
                switch(reader.NamespaceURI)
                {
                    case DC:
                    {
                        switch(reader.LocalName)
                        {
                            case "creator":
                                element.Creator = ReadContentString();
                                return true;
                            case "date":
                                element.Date = reader.ReadElementContentAsDateTime();
                                return true;
                            case "description":
                                element.Description = ReadContentString();
                                return true;
                        }

                        break;
                    }
                    case UPNP:
                    {
                        switch(reader.LocalName)
                        {
                            case "artist":
                                (element.Artists ?? (element.Artists = new List<string>())).Add(ReadContentString());
                                return true;
                            case "album":
                                element.Album = ReadContentString();
                                return true;
                            case "albumArtURI":
                                (element.AlbumArts ?? (element.AlbumArts = new List<string>())).Add(ReadContentString());
                                return true;
                            case "artistDiscographyURI":
                                element.DiscographyUri = ReadContentString();
                                return true;
                            case "lyricsURI":
                                element.LyricsUri = ReadContentString();
                                return true;
                            case "genre":
                                (element.Genres ?? (element.Genres = new List<string>())).Add(ReadContentString());
                                return true;
                            case "originalTrackNumber":
                                element.TrackNumber = reader.ReadElementContentAsInt();
                                return true;
                            case "actor":
                                (element.Actors ?? (element.Actors = new List<string>())).Add(ReadContentString());
                                return true;
                            case "author":
                                (element.Authors ?? (element.Authors = new List<string>())).Add(ReadContentString());
                                return true;
                            case "producer":
                                (element.Producers ?? (element.Producers = new List<string>())).Add(ReadContentString());
                                return true;
                            case "publisher":
                                (element.Publishers ?? (element.Publishers = new List<string>())).Add(ReadContentString());
                                return true;
                        }

                        break;
                    }
                }
            }

            return base.TryReadChildNode(reader, element);
        }

        #endregion
    }
}
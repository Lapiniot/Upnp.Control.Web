using System.Xml;

namespace Web.Upnp.Control.Models.DIDL
{
    public static partial class DIDLParser
    {
        private static Container ReadContainerNode(XmlReader r)
        {
            var container = new Container(r.GetAttribute("id"),
                r.GetAttribute("parentID"),
                ParseBoolean(r.GetAttribute("restricted")),
                ParseBoolean(r.GetAttribute("searchable")))
            {
                ChildCount = ParseInt(r.GetAttribute("childCount"))
            };

            r.Read();

            while(!(r.NodeType == XmlNodeType.EndElement && r.Name == "container"))
            {
                if(r.NodeType == XmlNodeType.Element)
                {
                    switch(r.NamespaceURI)
                    {
                        case DC:
                            switch(r.LocalName)
                            {
                                case "title":
                                    container.Title = r.ReadElementContentAsString();
                                    continue;
                            }

                            break;
                        case UPNP:
                            switch(r.LocalName)
                            {
                                case "class":
                                    container.Class = r.ReadElementContentAsString();
                                    continue;
                                case "storageUsed":
                                    container.StorageUsed = r.ReadElementContentAsInt();
                                    continue;
                            }

                            break;
                        default:
                            if(r.LocalName == "res")
                            {
                                container.Resource = ReadResourceNode(r);
                            }
                            else
                            {
                                container.Vendor[r.Name] = r.ReadElementContentAsString();
                            }

                            continue;
                    }
                }

                r.Read();
            }

            return container;
        }
    }
}
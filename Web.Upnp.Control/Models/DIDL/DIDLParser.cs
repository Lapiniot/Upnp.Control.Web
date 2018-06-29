﻿using System.Collections.Generic;
using System.IO;
using System.Xml;
using static System.Xml.XmlNodeType;

namespace Web.Upnp.Control.Models.DIDL
{
    public static class DIDLParser
    {
        private const string NS = "urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/";
        private const string DC = "http://purl.org/dc/elements/1.1/";
        private const string UPNP = "urn:schemas-upnp-org:metadata-1-0/upnp/";

        public static IEnumerable<object> Parse(string content)
        {
            var objects = new List<object>();

            using(var tr = new StringReader(content))
            using(var r = XmlReader.Create(tr))
            {
                if(r.MoveToContent() == Element && r.Name == "DIDL-Lite" && r.NamespaceURI == NS)
                {
                    while(r.Read())
                    {
                        if(r.NodeType == Element)
                        {
                            var item = ReadItem(r);

                            if(item != null) objects.Add(item);
                        }
                    }
                }
            }

            return objects;
        }

        private static object ReadItem(XmlReader reader)
        {
            if(reader.NamespaceURI == NS)
            {
                if(reader.Name == "container")
                {
                    return ReadContainerNode(reader);
                }
            }

            reader.Skip();

            return null;
        }

        private static object ReadContainerNode(XmlReader r)
        {
            var container = new Container(r.GetAttribute("id"),
                r.GetAttribute("parentID"),
                ParseBoolean(r.GetAttribute("restricted")),
                ParseBoolean(r.GetAttribute("searchable")))
            {
                ChildCount = ParseInt(r.GetAttribute("childCount"))
            };

            r.Read();

            while(!(r.NodeType == EndElement && r.Name == "container"))
            {
                if(r.NodeType == Element)
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
                            container.Vendor[r.Name] = r.ReadElementContentAsString();
                            continue;
                    }
                }

                r.Read();
            }

            return container;
        }

        private static int? ParseInt(string str)
        {
            return int.TryParse(str, out var value) ? (int?)value : null;
        }

        private static bool ParseBoolean(string str)
        {
            return str == "1" || bool.TryParse(str, out var value) && value;
        }
    }
}
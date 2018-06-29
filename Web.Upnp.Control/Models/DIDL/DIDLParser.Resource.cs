using System.Collections.Generic;
using System.Xml;

namespace Web.Upnp.Control.Models.DIDL
{
    public static partial class DIDLParser
    {
        private static Resource ReadResourceNode(XmlReader r)
        {
            var resource = new Resource();

            if(r.AttributeCount > 0)
            {
                for(var i = 0; i < r.AttributeCount; i++)
                {
                    r.MoveToAttribute(i);

                    if(r.Name == "protocolInfo")
                    {
                        resource.Protocol = r.Value;
                    }
                    else
                    {
                        resource.Attributes = resource.Attributes ?? new Dictionary<string, string>();
                        resource.Attributes[r.Name] = r.Value;
                    }
                }
            }

            r.MoveToElement();

            resource.Url = r.ReadElementContentAsString();

            return resource;
        }
    }
}
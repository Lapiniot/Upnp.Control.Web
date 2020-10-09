using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using IoT.Protocol.Upnp;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Web.Upnp.Control.Models.Events;
using Web.Upnp.Control.Routing;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/events/{deviceId}")]
    [Consumes("application/xml", "text/xml")]
    public class UpnpEventsController : ControllerBase
    {
        private readonly ILogger<UpnpEventsController> logger;
        private readonly IEnumerable<IObserver<UpnpEvent>> observers;
        private readonly XmlReaderSettings settings = new XmlReaderSettings { Async = true, IgnoreComments = true, IgnoreWhitespace = true };

        public UpnpEventsController(ILogger<UpnpEventsController> logger, IEnumerable<IObserver<UpnpEvent>> observers)
        {
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.observers = observers?.ToArray() ?? Array.Empty<IObserver<UpnpEvent>>();
        }

        [HttpNotify("[action]/{service}")]
        public Task NotifyAsync(string deviceId, string service)
        {
            return Task.CompletedTask;
        }

        [HttpNotify("notify/rc")]
        public async Task NotifyRenderingControlAsync(string deviceId, [FromHeader(Name = "SID")] string sid)
        {
            var xml = await XElement.LoadAsync(HttpContext.Request.Body, LoadOptions.None, default).ConfigureAwait(false);
            Debug.WriteLine(xml.ToString());
        }

        [HttpNotify("notify/avt")]
        public async Task NotifyAVTransportAsync(string deviceId)
        {
            IReadOnlyDictionary<string, string> properties;
            IReadOnlyDictionary<string, string> vendorProperties;

            using(var reader = XmlReader.Create(HttpContext.Request.Body, settings))
            {
                (properties, vendorProperties) = await EventMessageParser.ParseAsync(reader).ConfigureAwait(false);
            }

            if(properties == null || properties.Count == 0) return;

            NotifyObservers<UpnpAVTransportPropertyChangedevent>(deviceId, properties, vendorProperties);
        }

        private void NotifyObservers<T>(string deviceId, IReadOnlyDictionary<string, string> properties,
            IReadOnlyDictionary<string, string> vendorProperties)
            where T : UpnpPropertyChangedEvent, new()
        {
            var @event = new T() { DeviceId = deviceId, Properties = properties, VendorProperties = vendorProperties };

            foreach(var observer in observers)
            {
                try
                {
                    observer.OnNext(@event);
                }
                catch(Exception exception)
                {
                    logger.LogError(exception, $"Error sending UPnP event notification to observer {observer}");
                }
            }
        }
    }
}
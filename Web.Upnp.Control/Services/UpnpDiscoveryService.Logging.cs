using System.Text;
using IoT.Protocol.Upnp;
using Web.Upnp.Control.Models.Events;

namespace Web.Upnp.Control.Services
{
    public partial class UpnpDiscoveryService
    {
        private readonly ILogger<UpnpDiscoveryService> logger;

        [LoggerMessage(1, LogLevel.Information, "Started UPnP device discovery service...")]
        private partial void LogStarted();

        [LoggerMessage(2, LogLevel.Information, "Device expiration updated for UDN='{udn}'")]
        private partial void LogExpirationUpdated(string udn);

        [LoggerMessage(3, LogLevel.Information, "New device discovered with UDN='{udn}'")]
        private partial void LogDeviceDiscovered(string udn);

        [LoggerMessage(4, LogLevel.Error, "Error processing SSDP reply {startline} for USN={usn}")]
        private partial void LogReplyError(Exception exception, string startline, string usn);

        [LoggerMessage(5, LogLevel.Error, "Error discovering UPnP devices and services!")]
        private partial void LogError(Exception exception);

        [LoggerMessage(6, LogLevel.Error, "Error providing new data to the observer: {observer}")]
        private partial void LogNotifyError(Exception exception, IObserver<UpnpDiscoveryEvent> observer);

        [LoggerMessage(7, LogLevel.Error, "Error sending completion notification to the observer: {observer}")]
        private partial void LogNotifyCompleteError(Exception exception, IObserver<UpnpDiscoveryEvent> observer);

        [LoggerMessage(10, LogLevel.Trace, "{message}")]
        private partial void Trace(string message);

        private void TraceReply(SsdpReply reply)
        {
            var sb = new StringBuilder();

            sb.AppendLine();
            sb.AppendLine($"***** {reply.StartLine} *****");
            foreach(var (key, value) in reply)
            {
                sb.Append(key);
                sb.Append(": ");
                sb.AppendLine(value);
            }

            Trace(sb.ToString());
        }
    }
}
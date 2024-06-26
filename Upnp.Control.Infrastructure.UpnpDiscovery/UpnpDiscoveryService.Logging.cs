using System.Globalization;
using System.Text;
using IoT.Protocol.Upnp;

namespace Upnp.Control.Infrastructure.UpnpDiscovery;

internal partial class UpnpDiscoveryService
{
    private readonly ILogger<UpnpDiscoveryService> logger = logger;

    [LoggerMessage(11, LogLevel.Trace, "{message}")]
    private partial void Trace(string message);

    [LoggerMessage(12, LogLevel.Debug, "Device expiration updated for UDN='{udn}'")]
    private partial void LogExpirationUpdated(string udn);

    [LoggerMessage(13, LogLevel.Debug, "New device discovered with UDN='{udn}'")]
    private partial void LogDeviceDiscovered(string udn);

    [LoggerMessage(14, LogLevel.Debug, "Device with UDN='{udn}' has disappeared from the network")]
    private partial void LogDeviceDisappeared(string udn);

    [LoggerMessage(15, LogLevel.Information, "Host is ready and running, starting SSDP discovery...")]
    private partial void LogStarted();

    [LoggerMessage(16, LogLevel.Error, "Error processing SSDP reply {startLine} for USN={usn}")]
    private partial void LogReplyError(Exception exception, string startLine, string usn);

    [LoggerMessage(17, LogLevel.Error, "Error discovering UPnP devices and services!")]
    private partial void LogError(Exception exception);

    [LoggerMessage(18, LogLevel.Error, "Error providing new data to the observer: {observer}")]
    private partial void LogNotifyError(Exception exception, IObserver<UpnpDiscoveryEvent> observer);

    [LoggerMessage(19, LogLevel.Error, "Error sending completion notification to the observer: {observer}")]
    private partial void LogNotifyCompleteError(Exception exception, IObserver<UpnpDiscoveryEvent> observer);

    private void TraceReply(SsdpReply reply)
    {
        if (!logger.IsEnabled(LogLevel.Trace))
        {
            return;
        }

        var sb = new StringBuilder();

        sb.AppendLine();
        sb.AppendLine(CultureInfo.InvariantCulture, $"***** {reply.StartLine} *****");

        foreach (var (key, value) in reply)
        {
            sb.Append(key);
            sb.Append(": ");
            sb.AppendLine(value);
        }

        __TraceCallback(logger, sb.ToString(), null);
    }
}
namespace Web.Upnp.Control.Models;

public record GetDevicesQuery(string Category);
public record GetDeviceQuery(string DeviceId);
public record CDGetContentQuery(string DeviceId, string Path, GetContentOptions Options);
public record AVGetStateQuery(string DeviceId, bool? Detailed);
public record AVGetPositionQuery(string DeviceId, bool? Detailed);
public record AVGetPlayModeQuery(string DeviceId);
public record SysPropsGetPlaylistStateQuery(string DeviceId);
public record RCGetVolumeQuery(string DeviceId, bool? Detailed);
public record RCGetMuteQuery(string DeviceId);
public record CMGetProtocolInfoQuery(string DeviceId);
public record CMGetConnectionsQuery(string DeviceId);
public record CMGetConnectionInfoQuery(string DeviceId, string ConnectionId);
public record PSGetServerKeyQuery()
{
    public static PSGetServerKeyQuery Instance { get; } = new PSGetServerKeyQuery();
}
public record PSGetStateQuery(Uri Endpoint, NotificationType Type);
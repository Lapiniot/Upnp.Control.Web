namespace Upnp.Control.Models;

#region Device DB managemet queries

public record struct GetDevicesQuery(string Category, bool WithOffline);

public record struct GetDeviceQuery(string DeviceId);

#endregion

#region ContentDirectory queries

public record struct CDGetContentQuery(string DeviceId, string Path, GetContentOptions Options);

#endregion

#region Playback control state queries

public record struct AVGetStateQuery(string DeviceId, bool Detailed);

public record struct AVGetPositionQuery(string DeviceId, bool Detailed);

public record struct AVGetPlayModeQuery(string DeviceId);

public record struct RCGetVolumeQuery(string DeviceId, bool Detailed);

public record struct RCGetMuteQuery(string DeviceId);

#endregion

#region ConnectionManager queries

public record struct CMGetProtocolInfoQuery(string DeviceId);

public record struct CMGetConnectionsQuery(string DeviceId);

public record struct CMGetConnectionInfoQuery(string DeviceId, string ConnectionId);

#endregion

#region SysProperties queries

public record struct SysPropsGetPlaylistStateQuery(string DeviceId);

#endregion
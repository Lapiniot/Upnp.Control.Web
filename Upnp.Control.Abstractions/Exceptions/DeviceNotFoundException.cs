namespace Upnp.Control.Abstractions.Exceptions;

public sealed class DeviceNotFoundException : ApplicationException
{
    public DeviceNotFoundException(string deviceId) :
        base("Device not found in the database.") => DeviceId = deviceId;

    public DeviceNotFoundException(string deviceId, string message) :
        base(message) => DeviceId = deviceId;

    public DeviceNotFoundException(string deviceId, string message, Exception inner) :
        base(message, inner) => DeviceId = deviceId;

    public string DeviceId { get; }

    [DoesNotReturn]
    public static void Throw(string deviceId) => throw new DeviceNotFoundException(deviceId);
}
namespace Upnp.Control.Abstractions.Exceptions;

public sealed class ServiceNotSupportedException : ApplicationException
{
    public ServiceNotSupportedException(string serviceType) :
        base("Specified service type is not supported.") => ServiceType = serviceType;

    public ServiceNotSupportedException(string serviceType, string message) :
        base(message) => ServiceType = serviceType;

    public ServiceNotSupportedException(string serviceType, string message, Exception inner) :
        base(message, inner) => ServiceType = serviceType;

    public string ServiceType { get; }

    [DoesNotReturn]
    public static void Throw(string serviceType) => throw new ServiceNotSupportedException(serviceType);
}
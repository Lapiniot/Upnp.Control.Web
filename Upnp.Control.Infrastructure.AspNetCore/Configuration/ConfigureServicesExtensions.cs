using Upnp.Control.Services;

namespace Upnp.Control.Infrastructure.AspNetCore.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddBase64Encoders(this IServiceCollection services)
    {
        return services
            .AddTransient<IBase64UrlEncoder, Base64Encoders>()
            .AddTransient<IBase64UrlDecoder, Base64Encoders>();
    }

    public static IServiceCollection AddServerAddressesProvider(this IServiceCollection services)
    {
        return services.AddTransient<IServerAddressesProvider, ServerAddressesProvider>();
    }

    public static MvcOptions AddBinaryContentFormatter(this MvcOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        if(!options.OutputFormatters.Any(formatter => formatter is BinaryContentOutputFormatter))
        {
            options.OutputFormatters.Add(new BinaryContentOutputFormatter());
        }

        return options;
    }

    public static MvcOptions AddRequestCancelledExceptionFilter(this MvcOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        if(!options.Filters.Any(filter => filter is RequestCancelledExceptionFilterAttribute))
        {
            options.Filters.Add<RequestCancelledExceptionFilterAttribute>();
        }

        return options;
    }
}
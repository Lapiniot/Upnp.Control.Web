namespace Upnp.Control.Infrastructure.Configuration;

public static class OptionsBuilderExtensions
{
    public static OptionsBuilder<TOptions> Configure<TOptions, TBinder>(this OptionsBuilder<TOptions> builder)
        where TOptions : class
        where TBinder : OptionsBinder<TOptions>, new()
    {
        ArgumentNullException.ThrowIfNull(builder);

        return builder.Configure<IConfiguration>((options, configuration) => new TBinder().Bind(options, configuration));
    }

    public static OptionsBuilder<TOptions> Configure<TOptions, TBinder>(this OptionsBuilder<TOptions> builder, string configSectionPath)
        where TOptions : class
        where TBinder : OptionsBinder<TOptions>, new()
    {
        ArgumentNullException.ThrowIfNull(builder);

        if(string.IsNullOrEmpty(configSectionPath))
        {
            throw new ArgumentException($"'{nameof(configSectionPath)}' cannot be null or empty.", nameof(configSectionPath));
        }

        return builder.Configure<IConfiguration>((options, configuration) =>
        {
            var section = configuration.GetSection(configSectionPath);
            if(section.Exists())
            {
                new TBinder().Bind(options, section);
            }
        });
    }

    public static OptionsBuilder<TOptions> Configure<TOptions>(this OptionsBuilder<TOptions> builder, OptionsBinder<TOptions> binder, string configSectionPath)
        where TOptions : class
    {
        ArgumentNullException.ThrowIfNull(builder);
        ArgumentNullException.ThrowIfNull(binder);
        if(string.IsNullOrEmpty(configSectionPath))
        {
            throw new ArgumentException($"'{nameof(configSectionPath)}' cannot be null or empty.", nameof(configSectionPath));
        }

        return builder.Configure<IConfiguration>((options, configuration) =>
        {
            var section = configuration.GetSection(configSectionPath);
            if(section.Exists())
            {
                binder.Bind(options, section);
            }
        });
    }
}
namespace Upnp.Control.Extensions.DependencyInjection;

public static class CqrsServiceCollectionExtensions
{
    public static IServiceCollection AddCommand<TCommand, [DynamicallyAccessedMembers(PublicConstructors)] TCommandHandler>(this IServiceCollection services)
        where TCommandHandler : class, IAsyncCommandHandler<TCommand>
        => services.AddTransient<IAsyncCommandHandler<TCommand>, TCommandHandler>();

    public static IServiceCollection AddQuery<TQuery, TQueryResult, [DynamicallyAccessedMembers(PublicConstructors)] TQueryHandler>(this IServiceCollection services)
        where TQueryHandler : class, IAsyncQueryHandler<TQuery, TQueryResult>
        => services.AddTransient<IAsyncQueryHandler<TQuery, TQueryResult>, TQueryHandler>();

    public static IServiceCollection AddEnumerableQuery<TQuery, TQueryResult, [DynamicallyAccessedMembers(PublicConstructors)] TQueryHandler>(this IServiceCollection services)
        where TQueryHandler : class, IAsyncEnumerableQueryHandler<TQuery, TQueryResult>
        => services.AddTransient<IAsyncEnumerableQueryHandler<TQuery, TQueryResult>, TQueryHandler>();
}
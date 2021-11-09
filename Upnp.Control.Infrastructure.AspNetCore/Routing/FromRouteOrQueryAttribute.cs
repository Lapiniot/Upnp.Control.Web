using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Upnp.Control.Infrastructure.AspNetCore.Routing;

[AttributeUsage(AttributeTargets.Parameter)]
public sealed class FromRouteOrQueryAttribute : Attribute, IBindingSourceMetadata, IModelNameProvider
{
    public BindingSource BindingSource { get; } = CompositeBindingSource.Create(
        new[] { BindingSource.Path, BindingSource.Query }, "PathAndQuery");

    public string? Name { get; set; }
}
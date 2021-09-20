using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Web.Upnp.Control.Infrastructure
{
    internal sealed partial class RequestCancelledExceptionFilterAttribute : ExceptionFilterAttribute
    {
        #region Overrides of ExceptionFilterAttribute

        public override void OnException(ExceptionContext context)
        {
            if(context.Exception is not OperationCanceledException) return;

            LogCancelled(context.HttpContext.RequestServices.GetService<ILogger<RequestCancelledExceptionFilterAttribute>>());

            context.ExceptionHandled = true;
            context.Result = new StatusCodeResult(499);
        }

        #endregion

        [LoggerMessage(1, LogLevel.Warning, "Request cancelled by client")]
        private static partial void LogCancelled(ILogger<RequestCancelledExceptionFilterAttribute> logger);
    }
}
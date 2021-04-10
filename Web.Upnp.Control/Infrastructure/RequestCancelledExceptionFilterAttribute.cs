using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace Web.Upnp.Control.Infrastructure
{
    internal sealed class RequestCancelledExceptionFilterAttribute : ExceptionFilterAttribute
    {
        #region Overrides of ExceptionFilterAttribute

        public override void OnException(ExceptionContext context)
        {
            if(!(context.Exception is OperationCanceledException)) return;
            var logger = context.HttpContext.RequestServices.GetService<ILogger<RequestCancelledExceptionFilterAttribute>>();
            logger.LogWarning("Request cancelled by client");
            context.ExceptionHandled = true;
            context.Result = new StatusCodeResult(499);
        }

        #endregion
    }
}
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace EHR_Reports.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class RequirePermissionAttribute : TypeFilterAttribute
    {
        public RequirePermissionAttribute(string screenName, string actionName)
            : base(typeof(RequirePermissionFilter))
        {
            Arguments = new object[] { screenName, actionName };
        }
    }

    public class RequirePermissionFilter : IAsyncAuthorizationFilter
    {
        private readonly string _screenName;
        private readonly string _actionName;
        private readonly IRoleService _roleService;

        public RequirePermissionFilter(
            string screenName,
            string actionName,
            IRoleService roleService)
        {
            _screenName = screenName.ToLower();
            _actionName = actionName.ToLower();
            _roleService = roleService;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            if (!user.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new JsonResult(ResponseModel<object>.Failure("Authentication required."))
                {
                    StatusCode = StatusCodes.Status401Unauthorized
                };
                return;
            }

            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                context.Result = new JsonResult(ResponseModel<object>.Failure("User not found."))
                {
                    StatusCode = StatusCodes.Status401Unauthorized
                };
                return;
            }

            var permissions = await _roleService.GetUserPermissionsAsync(userId);

            var hasPermission = permissions.Any(p =>
                p.ScreenName.Equals(_screenName, StringComparison.OrdinalIgnoreCase) &&
                p.ActionName.Equals(_actionName, StringComparison.OrdinalIgnoreCase)
            );

            if (!hasPermission)
            {
                context.Result = new JsonResult(
                    ResponseModel<object>.Failure($"Access denied. Required permission: {_screenName} - {_actionName}"))
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
            }
        }
    }
}

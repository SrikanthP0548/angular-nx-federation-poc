using System;
using System.Linq;
using System.Security.Principal;
using System.Threading;
using System.Web;
using System.Web.Security;

namespace LegacyWeb.Core
{
    /// <summary>
    /// Restores the role-bearing principal from the Forms Authentication
    /// ticket after FormsAuthenticationModule has authenticated the request.
    /// </summary>
    public sealed class PrincipalModule : IHttpModule
    {
        public void Init(HttpApplication application)
        {
            application.AuthenticateRequest += OnAuthenticateRequest;
        }

        public void Dispose()
        {
        }

        private static void OnAuthenticateRequest(object sender, EventArgs args)
        {
            var application = (HttpApplication)sender;
            var identity = application.Context.User == null
                ? null
                : application.Context.User.Identity as FormsIdentity;

            if (identity == null || !identity.IsAuthenticated)
            {
                return;
            }

            var roles = (identity.Ticket.UserData ?? string.Empty)
                .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(role => role.Trim())
                .Where(role => role.Length > 0)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            var principal = new GenericPrincipal(identity, roles);
            application.Context.User = principal;
            Thread.CurrentPrincipal = principal;
        }
    }
}

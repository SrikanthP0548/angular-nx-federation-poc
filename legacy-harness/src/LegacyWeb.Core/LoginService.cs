using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Security;

namespace LegacyWeb.Core
{
    public static class LoginService
    {
        public static void Login(string username, IEnumerable<string> requestedRoles, HttpContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException("context");
            }

            var normalizedUser = (username ?? string.Empty).Trim();
            if (normalizedUser.Length == 0 || normalizedUser.Length > 100)
            {
                throw new ArgumentException("A username of 1-100 characters is required.", "username");
            }

            var roles = (requestedRoles ?? Enumerable.Empty<string>())
                .Select(role => (role ?? string.Empty).Trim())
                .Where(role => role.Length > 0 && role.Length <= 50)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            var issuedUtc = DateTime.UtcNow;
            var ticket = new FormsAuthenticationTicket(
                2,
                normalizedUser,
                issuedUtc.ToLocalTime(),
                issuedUtc.AddMinutes(20).ToLocalTime(),
                false,
                string.Join(",", roles),
                "/");

            var authCookie = new HttpCookie(FormsAuthentication.FormsCookieName, FormsAuthentication.Encrypt(ticket))
            {
                HttpOnly = true,
                Path = "/",
                Secure = FormsAuthentication.RequireSSL,
                SameSite = SameSiteMode.Lax
            };

            context.Response.Cookies.Add(authCookie);
            context.Session["UserName"] = normalizedUser;
            context.Session["Roles"] = roles;
        }

        public static void RedirectToConfiguredDestination(HttpContext context)
        {
            var destination = ConfigurationManager.AppSettings["LoginDestination"] ?? "/default.asp";
            if (!IsSafeRootRelativePath(destination))
            {
                throw new ConfigurationErrorsException("LoginDestination must be a root-relative same-origin path.");
            }

            context.Response.Redirect(destination, false);
            context.ApplicationInstance.CompleteRequest();
        }

        public static void Logout(HttpContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException("context");
            }

            context.Session.Clear();
            context.Session.Abandon();
            FormsAuthentication.SignOut();
            ExpireCookie(context, FormsAuthentication.FormsCookieName, true);
            ExpireCookie(context, "ASP.NET_SessionId", true);
        }

        private static void ExpireCookie(HttpContext context, string name, bool httpOnly)
        {
            context.Response.Cookies.Add(new HttpCookie(name, string.Empty)
            {
                Expires = DateTime.UtcNow.AddYears(-1),
                HttpOnly = httpOnly,
                Path = "/",
                SameSite = SameSiteMode.Lax
            });
        }

        private static bool IsSafeRootRelativePath(string value)
        {
            return !string.IsNullOrWhiteSpace(value)
                && value[0] == '/'
                && (value.Length == 1 || value[1] != '/')
                && value.IndexOf('\\') < 0
                && !value.Contains("..");
        }
    }
}

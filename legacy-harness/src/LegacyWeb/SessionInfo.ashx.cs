using System;
using System.Web;
using System.Web.SessionState;

namespace LegacyWeb
{
    public sealed class SessionInfoHandler : IHttpHandler, IRequiresSessionState
    {
        public bool IsReusable { get { return false; } }

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain; charset=utf-8";
            context.Response.Cache.SetCacheability(HttpCacheability.NoCache);

            if (!context.Request.IsLocal)
            {
                context.Response.StatusCode = 403;
                return;
            }

            if (context.User == null || context.User.Identity == null || !context.User.Identity.IsAuthenticated)
            {
                context.Response.StatusCode = 401;
                return;
            }

            var username = Convert.ToString(context.Session["UserName"]);
            var roles = context.Session["Roles"] as string[] ?? new string[0];
            if (string.IsNullOrWhiteSpace(username))
            {
                context.Response.StatusCode = 409;
                return;
            }

            context.Response.Write(username + "|" + string.Join(",", roles));
        }
    }
}

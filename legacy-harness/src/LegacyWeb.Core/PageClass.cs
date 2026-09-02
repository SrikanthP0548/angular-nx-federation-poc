using System;
using System.Web;
using System.Web.Security;
using System.Web.UI;

namespace LegacyWeb.Core
{
    /// <summary>Base page used by authenticated WebForms resources.</summary>
    public abstract class PageClass : Page
    {
        protected override void OnInit(EventArgs e)
        {
            if (Context.User == null || Context.User.Identity == null || !Context.User.Identity.IsAuthenticated)
            {
                var returnUrl = HttpUtility.UrlEncode(Request.RawUrl);
                Response.Redirect(FormsAuthentication.LoginUrl + "?ReturnUrl=" + returnUrl, true);
                return;
            }

            base.OnInit(e);
        }
    }
}

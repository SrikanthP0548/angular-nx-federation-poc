using System;
using System.Linq;
using System.Web.UI;
using LegacyWeb.Core;

namespace LegacyWeb
{
    public partial class LandingPage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!string.Equals(Request.HttpMethod, "POST", StringComparison.OrdinalIgnoreCase))
            {
                Response.Redirect("/FakeIdp.aspx", true);
                return;
            }

            var roles = Request.Form.GetValues("roles") ?? new string[0];
            LoginService.Login(Request.Form["username"], roles.Where(role => role != null), Context);
            LoginService.RedirectToConfiguredDestination(Context);
        }
    }
}

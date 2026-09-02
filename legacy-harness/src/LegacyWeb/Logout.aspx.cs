using System;
using System.Web.UI;
using LegacyWeb.Core;

namespace LegacyWeb
{
    public partial class LogoutPage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            LoginService.Logout(Context);
            Response.Redirect("/Login.aspx", false);
            Context.ApplicationInstance.CompleteRequest();
        }
    }
}

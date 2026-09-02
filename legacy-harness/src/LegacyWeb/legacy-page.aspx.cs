using System;
using System.IO;
using System.Web.UI;
using LegacyWeb.Core;

namespace LegacyWeb
{
    public partial class LegacyPage : PageClass
    {
        private bool downloadStarted;

        protected int PostbackCount
        {
            get { return ViewState["PostbackCount"] == null ? 0 : (int)ViewState["PostbackCount"]; }
        }

        protected string SessionIdentity
        {
            get
            {
                var username = Convert.ToString(Session["UserName"]);
                var roles = Session["Roles"] as string[] ?? new string[0];
                return username + " [" + string.Join(",", roles) + "]";
            }
        }

        protected void Page_Load(object sender, EventArgs e)
        {
        }

        protected void IncrementButton_Click(object sender, EventArgs e)
        {
            ViewState["PostbackCount"] = PostbackCount + 1;
        }

        protected void DownloadButton_Click(object sender, EventArgs e)
        {
            downloadStarted = true;
            Response.Clear();
            Response.ContentType = "text/plain";
            Response.AddHeader("Content-Disposition", "attachment; filename=webforms-sample.txt");
            Response.Write("Download produced by the real WebForms harness.\r\n");
            Context.ApplicationInstance.CompleteRequest();
        }

        protected override void Render(HtmlTextWriter writer)
        {
            if (!downloadStarted)
            {
                base.Render(writer);
            }
        }
    }
}

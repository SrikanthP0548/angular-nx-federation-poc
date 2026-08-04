using System;
using System.Web.Script.Serialization;

namespace LegacyWeb
{
    /// <summary>
    /// Code-behind for the migrated Pricing page (doc section 8.3).
    ///
    /// Provides host context and legacy navigation integration only. The
    /// pricing business logic that used to live in Pricing.asp / Pricing.xsl
    /// now lives in the Angular feature and the BFF; reproducing any of it
    /// here would defeat the migration.
    /// </summary>
    public partial class Pricing : System.Web.UI.Page
    {
        protected string CustomerId { get; private set; }

        protected string BootstrapContextJson { get; private set; }

        protected void Page_Load(object sender, EventArgs e)
        {
            CustomerId = Request.QueryString["customerId"] ?? string.Empty;

            // The BFF validates authorization independently of this page; the
            // permissions below drive UI affordances only, never enforcement.
            var context = new
            {
                apiBaseUrl = "/api",
                assetBasePath = "/ui",
                permissions = new[] { "pricing.view" }
            };

            BootstrapContextJson = new JavaScriptSerializer().Serialize(context);
        }
    }
}

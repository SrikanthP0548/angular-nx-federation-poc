<%--
  Page-specific entry point (doc section 8.2).

  The code-behind supplies host context and legacy navigation integration
  only — no migrated business logic (doc section 8.3). Note that the feature
  version is NOT named here: the shell resolves "pricing" through the runtime
  manifest, which is what makes rollback a manifest change rather than an
  ASPX redeployment.
--%>
<%@ Page Language="C#"
         MasterPageFile="~/AngularHost.Master"
         CodeBehind="Pricing.aspx.cs"
         Inherits="LegacyWeb.Pricing" %>

<asp:Content ContentPlaceHolderID="AngularPageContent" runat="server">
  <main id="angular-page-host" data-angular-feature="pricing">
    <ca-pricing-page customer-id="<%= Server.HtmlEncode(CustomerId) %>"></ca-pricing-page>
  </main>

  <%-- Non-sensitive bootstrap configuration only: no tokens, no secrets,
       no complete user profile (doc section 8.3). --%>
  <script type="application/json" id="angular-bootstrap-context">
    <%= BootstrapContextJson %>
  </script>
</asp:Content>

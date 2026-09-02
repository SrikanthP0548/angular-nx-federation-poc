<%@ Page Language="C#"
         MasterPageFile="~/Site.Master"
         CodeBehind="legacy-page.aspx.cs"
         Inherits="LegacyWeb.LegacyPage" %>

<asp:Content ContentPlaceHolderID="PageTitle" runat="server">ASPX page — legacy harness</asp:Content>

<asp:Content ContentPlaceHolderID="PageContent" runat="server">
  <p>ASPX page backed by real WebForms, ViewState, Forms Authentication, and StateServer session.</p>
  <p id="session-identity">Authenticated session: <%= Server.HtmlEncode(SessionIdentity) %></p>
  <p id="postback-count">Postback count: <%= PostbackCount %></p>
  <asp:Button ID="IncrementButton" runat="server" Text="Increment postback count" OnClick="IncrementButton_Click" />
  <asp:Button ID="DownloadButton" runat="server" Text="Download from WebForms" OnClick="DownloadButton_Click" />

  <section id="angular-page-host" data-angular-feature="pricing-search">
    <p>This page also hosts the existing federated Angular feature:</p>
    <ca-pricing-search customer-id="1001"></ca-pricing-search>
  </section>
</asp:Content>

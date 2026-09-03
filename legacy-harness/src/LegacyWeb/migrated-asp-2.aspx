<%@ Page Language="C#" MasterPageFile="~/Site.Master" %>

<asp:Content ContentPlaceHolderID="PageTitle" runat="server">Migrated ASPX page 2 — feature two</asp:Content>

<asp:Content ContentPlaceHolderID="PageContent" runat="server">
  <p>This Web Forms page hosts the federated Angular settlement instructions feature.</p>

  <section id="angular-page-host" data-angular-feature="feature-two">
    <ca-feature-two reference="SSI-4471"></ca-feature-two>
  </section>
</asp:Content>

<%@ Page Language="C#" MasterPageFile="~/Site.Master" %>

<asp:Content ContentPlaceHolderID="PageTitle" runat="server">Migrated ASPX page 1 — pricing search</asp:Content>

<asp:Content ContentPlaceHolderID="PageContent" runat="server">
  <p>This Web Forms page hosts the federated Angular pricing search feature.</p>

  <section id="angular-page-host" data-angular-feature="pricing-search">
    <ca-pricing-search customer-id="1001"></ca-pricing-search>
  </section>
</asp:Content>

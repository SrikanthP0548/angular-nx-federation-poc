<%
Sub RenderLegacyHeader(pageTitle)
%>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #fffbea; }
    .chrome { background: #7a4b00; color: #fff; padding: .75rem 1.25rem; display: flex; gap: 1.25rem; align-items: baseline; flex-wrap: wrap; }
    .chrome a { color: #ffe2ad; font-size: .875rem; }
    main { margin: 1rem; max-width: 52rem; }
    form { margin: 1rem 0; }
  </style>
  <header class="chrome">
    <strong><%= Server.HTMLEncode(pageTitle) %></strong>
    <a href="/default.asp">/default.asp</a>
    <a href="/legacy-page.asp">/legacy-page.asp</a>
    <a href="/legacy-page.aspx">/legacy-page.aspx</a>
    <a href="/migrated-asp-1.aspx">/migrated-asp-1.aspx</a>
    <a href="/migrated-asp-2.aspx">/migrated-asp-2.aspx</a>
    <a href="/Logout.aspx">Logout</a>
  </header>
<%
End Sub
%>

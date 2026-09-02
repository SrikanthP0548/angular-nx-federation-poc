<%@ Language=VBScript CodePage=65001 %>
<!--#include virtual="/asp-include/SessionBridge.asp" -->
<!--#include virtual="/asp-include/Header.asp" -->
<%
Response.Buffer = True
Dim bridgeIdentity, isPopup
bridgeIdentity = RestoreUserSession()
isPopup = (Request.QueryString("popup") = "1")
%>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Classic ASP page — real IIS harness</title>
  </head>
  <body>
    <% If isPopup Then %>
      <% RenderLegacyHeader "Popup (/legacy-page.asp)" %>
      <main><p>Opened as a Popup from a direct click on /default.asp.</p></main>
    <% Else %>
      <% RenderLegacyHeader "Classic ASP page (/legacy-page.asp)" %>
      <main>
        <p>Classic ASP page reached through real IIS navigation.</p>
        <p id="bridge-identity">StateServer identity through COM: <%= Server.HTMLEncode(bridgeIdentity) %></p>
      </main>
    <% End If %>
  </body>
</html>

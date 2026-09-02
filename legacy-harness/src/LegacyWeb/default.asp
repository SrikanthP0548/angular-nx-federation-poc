<%@ Language=VBScript CodePage=65001 %>
<!--#include virtual="/asp-include/SessionBridge.asp" -->
<!--#include virtual="/asp-include/Header.asp" -->
<%
Response.Buffer = True
Dim bridgeIdentity, submittedValue
bridgeIdentity = InitASPSessionState()
submittedValue = ""
If Request.ServerVariables("REQUEST_METHOD") = "POST" Then
  submittedValue = Request.Form("q")
End If
%>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Legacy application home — real IIS harness</title>
  </head>
  <body>
    <% RenderLegacyHeader "Legacy application home (/default.asp)" %>
    <main>
      <p>Stands in for the real ASP Classic entry page loaded into legacy-container's iframe.</p>
      <p id="bridge-identity">StateServer identity through COM: <%= Server.HTMLEncode(bridgeIdentity) %></p>
      <% If Len(submittedValue) > 0 Then %>
        <p id="postback-value">Submitted: <%= Server.HTMLEncode(submittedValue) %></p>
      <% End If %>
      <form method="post" action="/default.asp">
        <label>Postback-style form <input name="q" autocomplete="off" /></label>
        <button type="submit">Submit</button>
      </form>
      <p>
        <a href="#" id="popup-link" onclick="window.open('/legacy-page.asp?popup=1','_blank','width=420,height=320'); return false;">Open popup</a>
        &nbsp;|&nbsp;
        <a href="/downloads/sample.txt" id="download-link" download="sample.txt">Download sample file</a>
      </p>
    </main>
  </body>
</html>

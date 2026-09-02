<%@ Page Language="C#" CodeBehind="Login.aspx.cs" Inherits="LegacyWeb.LoginPage" %>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Legacy harness login</title>
    <script>
      if (window.top !== window.self) window.top.location.href = window.self.location.href;
    </script>
  </head>
  <body>
    <main>
      <h1>Legacy harness login</h1>
      <p>This page deliberately escapes an iframe, matching the expired-session behavior under test.</p>
      <p><a href="/FakeIdp.aspx">Continue to fake identity provider</a></p>
    </main>
  </body>
</html>

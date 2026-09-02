<%@ Page Language="C#" CodeBehind="FakeIdp.aspx.cs" Inherits="LegacyWeb.FakeIdpPage" %>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Fake identity provider</title>
  </head>
  <body>
    <main>
      <h1>Fake identity provider</h1>
      <p>This is a local harness stub, not Okta.</p>
      <form method="post" action="/Landing.aspx">
        <label>Username <input name="username" value="e2e-user" maxlength="100" required /></label>
        <fieldset>
          <legend>Roles</legend>
          <label><input type="checkbox" name="roles" value="pricing.view" checked /> pricing.view</label>
          <label><input type="checkbox" name="roles" value="legacy.user" checked /> legacy.user</label>
        </fieldset>
        <button type="submit">Sign in</button>
      </form>
    </main>
  </body>
</html>

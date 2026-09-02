<%
Function RestoreUserSession()
  Dim sessionId, authCookie, bridge, identity
  sessionId = Request.Cookies("ASP.NET_SessionId")
  authCookie = Request.Cookies(".LEGACYAUTH")

  If Len(sessionId) = 0 Or Len(authCookie) = 0 Then
    Response.Redirect("/Login.aspx")
  End If

  On Error Resume Next
  Set bridge = Server.CreateObject("LegacyComBridge.SessionBridge")
  If Err.Number <> 0 Then
    Response.Status = "500 Internal Server Error"
    Response.Write("COM bridge activation failed. Reference: legacy-harness.com.activation")
    Response.End
  End If

  identity = bridge.GetSessionUser(sessionId, authCookie)
  If Err.Number <> 0 Then
    Response.Status = "500 Internal Server Error"
    Response.Write("COM bridge call failed. Reference: legacy-harness.com.call")
    Response.End
  End If
  On Error GoTo 0

  If Len(identity) = 0 Then
    Response.Redirect("/Login.aspx")
  End If

  Session("BridgeIdentity") = identity
  RestoreUserSession = identity
End Function

Function InitASPSessionState()
  InitASPSessionState = RestoreUserSession()
End Function
%>

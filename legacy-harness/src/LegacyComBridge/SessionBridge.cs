using System;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;

[assembly: ComVisible(true)]
[assembly: Guid("EF41A412-65CB-44B9-B63F-23C59D47F73E")]

namespace LegacyComBridge
{
    [ComVisible(true)]
    [Guid("7A19F46B-4798-43BE-A2F7-B7852A7FE419")]
    [InterfaceType(ComInterfaceType.InterfaceIsDual)]
    public interface ISessionBridge
    {
        string GetSessionUser(string sessionId, string authCookie);
    }

    /// <summary>
    /// Harness-only COM bridge proving real IDispatch activation and a
    /// StateServer-backed ASP.NET session lookup from Classic ASP.
    /// </summary>
    [ComVisible(true)]
    [Guid("E0799555-E9EF-4449-8883-7F0AAF732A99")]
    [ProgId("LegacyComBridge.SessionBridge")]
    [ClassInterface(ClassInterfaceType.None)]
    public sealed class SessionBridge : ISessionBridge
    {
        private static readonly Uri SessionEndpoint = new Uri("http://127.0.0.1:8800/SessionInfo.ashx");

        public string GetSessionUser(string sessionId, string authCookie)
        {
            if (string.IsNullOrWhiteSpace(sessionId) || string.IsNullOrWhiteSpace(authCookie))
            {
                return string.Empty;
            }

            var request = (HttpWebRequest)WebRequest.Create(SessionEndpoint);
            request.Method = "GET";
            request.AllowAutoRedirect = false;
            request.Proxy = null;
            request.Timeout = 10000;
            request.ReadWriteTimeout = 10000;
            request.CookieContainer = new CookieContainer();
            request.CookieContainer.Add(SessionEndpoint, new Cookie("ASP.NET_SessionId", sessionId, "/"));
            request.CookieContainer.Add(SessionEndpoint, new Cookie(".LEGACYAUTH", authCookie, "/"));

            try
            {
                using (var response = (HttpWebResponse)request.GetResponse())
                {
                    if (response.StatusCode != HttpStatusCode.OK)
                    {
                        return string.Empty;
                    }

                    using (var reader = new StreamReader(response.GetResponseStream()))
                    {
                        return reader.ReadToEnd().Trim();
                    }
                }
            }
            catch (WebException)
            {
                return string.Empty;
            }
        }
    }
}

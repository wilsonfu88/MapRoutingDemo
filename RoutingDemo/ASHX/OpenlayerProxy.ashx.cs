using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;

namespace RoutingDemo.ASHX
{
    /// <summary>
    /// OpenlayerProxy 的摘要说明
    /// </summary>
    public class OpenlayerProxy : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            //这个里面的return一定要记得去掉
            if (string.IsNullOrEmpty(context.Request["URL"]))
            {
                return;
            }
            //return;
            string url = context.Request["URL"];

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(context.Server.UrlDecode(url));
            request.UserAgent = context.Request.UserAgent;
            request.Accept = "text/html, application/xhtml+xml, */*";
            request.ContentType = context.Request.ContentType;
            request.Method = context.Request.HttpMethod;

            byte[] buffer = new byte[8 * 1024];
            int bufferLength = 8 * 1024;
            int ret = 0;

            if (request.Method.ToUpper() == "POST")
            {
                Stream nstream = request.GetRequestStream();
                ret = context.Request.InputStream.Read(buffer, 0, bufferLength);
                while (ret > 0)
                {
                    nstream.Write(buffer, 0, ret);
                    ret = context.Request.InputStream.Read(buffer, 0, bufferLength);
                }
                nstream.Close();
            }
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            context.Response.ContentType = response.ContentType;
            Stream proxyResStream = response.GetResponseStream();
            Stream realOutputStream = context.Response.OutputStream;
            ret = proxyResStream.Read(buffer, 0, bufferLength);
            while (ret > 0)
            {
                realOutputStream.Write(buffer, 0, ret);
                ret = proxyResStream.Read(buffer, 0, bufferLength);
            }
            response.Close();
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}
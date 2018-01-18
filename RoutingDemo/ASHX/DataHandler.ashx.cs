using RoutingDemo.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using static RoutingDemo.DAL.PGDAL;

namespace RoutingDemo.ASHX
{
    /// <summary>
    /// DataHandler 的摘要说明
    /// </summary>
    public class DataHandler : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "application/json";
            double x = 0, y = 0;
            double.TryParse(context.Request.QueryString["x"], out x);
            double.TryParse(context.Request.QueryString["y"], out y);
            if (x > 0 && y > 0)
            {
                Point p = PGDAL.GetPointNearby(x, y);
                if (p != null)
                {
                    context.Response.Write(JsonConvert.SerializeObject(p));
                }
            }
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
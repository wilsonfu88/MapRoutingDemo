using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Npgsql;
using System.Configuration;

namespace RoutingDemo.DAL
{
    public class PGDAL
    {
        public static void Test01()
        {
            using (var conn = new NpgsqlConnection(ConfigurationManager.ConnectionStrings["pgData"].ConnectionString))
            {
                conn.Open();

                using (var cmd = new NpgsqlCommand("select * from xmpark_road_vertices_pgr", conn))
                {
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            Console.WriteLine(reader.GetInt64(0));
                        }
                    }
                }
            }

        }


        public static Point GetPointNearby(double x, double y)
        {
            Point point = null;

            string sql = string.Format(@"select  id,ST_X(the_geom) as x,ST_Y(the_geom) as y
 from xmpark_road_vertices_pgr
order by ST_Distance(ST_GeomFromText('POINT({0} {1})', 3857), the_geom)
limit 1", x, y);
            using (var conn = new NpgsqlConnection(ConfigurationManager.ConnectionStrings["pgData"].ConnectionString))
            {
                using (var cmd = new NpgsqlCommand(sql,conn))
                {
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            point = new Point
                            {
                                Id = reader.GetInt64(0),
                                X = reader.GetDouble(1),
                                Y = reader.GetDouble(2)
                            };
                        }
                    }
                    return point;
                }
            }
        }


        public class Point
        {
            public long Id { get; set; }
            public double X { get; set; }

            public double Y { get; set; }
        }
    }
}
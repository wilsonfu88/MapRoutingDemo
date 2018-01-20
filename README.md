# MapRoutingDemo
一个基于pGrouting实现最短路径规划的示例，使用到的开源工具geoserver、postgressql、postgis、pGrouting，pgsql的数据访问使用Npgsql 

根据起止点坐标找到起止导航的坐标点，虚线为无路网导航，红色线为基于路网的导航


使用pGrouting的坑

1、必须通过拓扑打断相交线，一般使用Arcgis工具，见https://www.cnblogs.com/gotoschool/p/6371104.html

2、通过PostGISShapefile 导入shp空间数据必须勾选简单类型，如果导入的是muti类型，拓扑网点将计算失败


详见博客文章：

http://www.cnblogs.com/weiweictgu/p/8280285.html


最终实现的效果见：


![运行效果](https://github.com/wilsonfu88/MapRoutingDemo/blob/master/TIM%E6%88%AA%E5%9B%BE20180118165020.png)


参考http://blog.csdn.net/u014529917/article/details/72866436?from=singlemessage



http://www.npgsql.org/

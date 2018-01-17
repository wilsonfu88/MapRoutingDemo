
var userOverlay, carOverlay, TyMap;

$(function () {
    TyMap = new TyMapUtils();
    TyMap.initConfig();
    TyMap.createMap('map');

    window.onresize = function () {
        TyMap.getMap().updateSize();
    }

    $('#btnFullMap').click(function () {
        TyMap.zoomToFull();
    });

    $('#btnMoveToUp').click(function () {
        TyMap.moveToUp();
    });

    $('#btnMoveToDown').click(function () {
        TyMap.moveToDown();
    });

    $('#btnMoveToLeft').click(function () {
        TyMap.moveToLeft();
    });

    $('#btnMoveToRight').click(function () {
        TyMap.moveToRight();
    });

    $('#btnPrevView').click(function () {
        TyMap.gotoPrevView();
    });

    $('#btnNextView').click(function () {
        TyMap.gotoNextView();
    });

    userOverlay = TyMap.createOverlayexLayer({ id: "user", map: TyMap.getMap() });
    carOverlay = TyMap.createOverlayexLayer({ id: "cars", map: TyMap.getMap() });
    trackOverlay = TyMap.createFeatureLayer({ map: TyMap.getMap() });
    largeOverlay = TyMap.createFeatureLayer({ map: TyMap.getMap() });//海量矢量图层

    showUserPoint([501965.328930658, 2494422.572178478]);

    //定位人员
    function showUserPoint(pos) {
        //先检查一下，目标是否已经存在于地图上，不存在才添加
        if (userOverlay.getOverlayexById("guid"))
            return;
        var icon = new TyMapUtils.Icon("images/p2-1.png", [46, 46], { offset: [1, 1] });
        var label = new TyMapUtils.Label("姓名：张三<br>单位：Apple Inc", { offset: [40, 0], style: { backgroundColor: "#4a86e8", fontSize: 12, fontName: "arial" } });
        var marker = new TyMapUtils.Marker({
            id: "guid",
            position: pos,
            icon: icon,
            label: label,
            offset: [-23, -23]
        });
        //设置实体对象，附加对象
        marker.setFlag({
            id: "guid",
            name: "张三"
        });
        userOverlay.addOverlayex(marker);
        marker.addEventListener('click', function (overlayex,event) {
            var obj = overlayex.flag;
            alert("marker clicked,实体对象id：" + obj.id + ",name：" + obj.name);
        });
    }

    //自定义样式
    var regionOverlay = TyMap.createFeatureLayer({ map: TyMap.getMap() });
    $('#btnTestFeature').click(function () {
        region();
        function region() {
            //一个polygon的点坐标；
            var data = [[
                {
                    "x": 100772.84368896484, "y": 22978.83087158203
                },
                {
                    "x": 101448.1879272461, "y": 22219.068725585937
                },
                {
                    "x": 102102.42749023437, "y": 21986.91912841797
                },
                {
                    "x": 103453.11572265625, "y": 22662.263305664062
                },
                {
                    "x": 104170.66888427734, "y": 22662.263305664062
                },
                {
                    "x": 104466.13189697265, "y": 22071.33709716797
                }],
                [{
                    "x": 100772.84368896484, "y": 22978.83087158203
                },
                {
                    "x": 101324.81188964844, "y": 23326.44873046875
                },
                {
                    "x": 101365.33251953125, "y": 23461.517517089843
                },
                {
                    "x": 101419.36010742187, "y": 23623.60009765625
                },
                {
                    "x": 101554.42889404297, "y": 23839.710327148437
                },
                {
                    "x": 101608.4564819336, "y": 24096.340881347656
                }],
                [{
                    "x": 120820.94311523437, "y": 17662.687927246093
                },
                {
                    "x": 119073.4439086914, "y": 16685.426879882812
                },
                {
                    "x": 115275.95770263672, "y": 14847.362487792968
                },
                {
                    "x": 114239.08489990234, "y": 14851.577514648437
                },
                {
                    "x": 112683.77587890625, "y": 15235.136108398437
                },
                {
                    "x": 112705.71069335937, "y": 15424.922729492187
                }], [{
                    "x": 120409.3286743164, "y": 24698.718688964843
                },
                {
                    "x": 120760.99871826172, "y": 24820.694274902343
                },
                {
                    "x": 120958.57348632812, "y": 24845.39129638672
                },
                {
                    "x": 121065.59307861328, "y": 24738.371520996093
                },
                {
                    "x": 121353.7230834961, "y": 24787.76531982422
                },
                {
                    "x": 121386.65228271484, "y": 24606.65509033203
                }]
            ];


            var geoJsonObject = {
                'type': 'FeatureCollection',
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:2415'
                    }
                },
                'features': []
            };

            for (var i = 0; i < data.length; i++) {
                var val = [];
                for (var j = 0, k = data[i]; j < k.length; j++) {
                    val.push([k[j].x, k[j].y]);
                }
                //val.push(k[0].x, k[0].y);

                var text = "";
                var person = "";
                switch (i) {
                    case 0:
                        text = "南山队";
                        person = "吴双";
                        break;
                    case 1:
                        text = "罗湖队";
                        person = "王丹";
                        break;
                    case 2:
                        text = "宝安队";
                        person = "小高,罗文";
                        break;
                    case 3:
                        text = "盐田";
                        person = "michael, 许经理";
                        break;
                    default:
                        text = "龙岗队";
                        person = "未配置";
                        break;
                }
                if (i != 2) {
                    geoJsonObject.features.push({
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [val]
                        },
                        "properties": {
                            "data": {
                                "name": "片区名称:" + text,
                                "team": "巡查成员:" + person,
                                "style": i
                            }
                        }
                    });
                }
                else {
                    geoJsonObject.features.push({
                        'type': 'Feature',
                        'geometry': {
                            "type": "GeometryCollection",
                            "geometries": [
                              {
                                  "type": "Polygon",
                                  "coordinates": [val]
                              },
                              {
                                  "type": "LineString",
                                  "coordinates": [[115406.2012422735, 15685.49405025905], [117109.63865158451, 16170.266751723051]]
                              }
                            ]
                        },
                        "properties": {
                            "data": {
                                "name": "片区名称:" + text,
                                "team": "巡查成员:" + person,
                                "style": i
                            }
                        }
                    });
                }

                //var polygon = new ol.geom.Polygon([val]);
                //var extent = polygon.getExtent();
                //var point = ol.extent.getCenter(extent);
            }

            //动态样式
            function styleFunc(feature) {
                var obj = feature.getProperties();
                return getStyle(obj.data.style);
            }

            var feature = (new ol.format.GeoJSON()).readFeatures(geoJsonObject);
            for (var x = 0; x < feature.length; x++) {
                feature[x].setId("f" + x.toString());
                feature[x].setStyle([styleFunc(feature[x]), getLabelStyle(x)]);
                //if (x == 2)
                //{
                //    feature[x].setGeometry(
                //        new ol.geom.LineString([[115406.2012422735,15685.49405025905],[117109.63865158451,16170.266751723051]])
                //    );
                //    feature[x].setGeometryName("test");
                //}
                regionOverlay.addFeature(feature[x]);
            }
            //结束动态


            //静态
            //for (var i = 0; i < data.length; i++)
            //{
            //    var val = [];
            //    for (var j = 0, k = data[i]; j < k.length; j++)
            //    {
            //        val.push([k[j].x,k[j].y]);
            //    }
            //    var polygon = new ol.geom.Polygon([val]);
            //    var extent=polygon.getExtent();
            //    var point = ol.extent.getCenter(extent);
            //    var feature = new ol.Feature({
            //        geometry: polygon,
            //        labelPoint: new ol.geom.Point(point)
            //    });
            //    feature.setStyle([getStyle(i), getLabelStyle(i)]);
            //    regionOverlay.addFeature(feature);
            //}
            //结束静态

            function getLabelStyle(index) {
                var text = "";
                switch (index) {
                    case 0:
                        text = "南山队";
                        break;
                    case 1:
                        text = "罗湖队";
                        break;
                    case 2:
                        text = "宝安队";
                        break;
                    case 3:
                        text = "盐田队";
                        break;
                    default:
                        text = "龙岗队";
                        break;
                }
                var fillColors = [[26, 188, 156, 0.5], [155, 89, 182, 0.5], [192, 57, 43, 0.5], [127, 140, 141, 0.5]];
                var strokeColors = ["#008080", "#0000FF", "#800080", "#B22222"];
                var colorIndex = Math.floor(Math.random() * 4);
                var style = new ol.style.Style({
                    text: new ol.style.Text({
                        text: text,
                        fill: new ol.style.Fill({
                            color: "#E74C3C"
                        })
                    })
                });
                return style;
            }


            function getStyle(index) {
                var fillColors = [[26, 188, 156, 0.5], [155, 89, 182, 0.5], [192, 57, 43, 0.5], [127, 140, 141, 0.5]];
                var strokeColors = ["#008080", "#0000FF", "#800080", "#B22222"];
                var colorIndex = index || Math.floor(Math.random() * 4);
                var style = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: fillColors[colorIndex]
                    }),
                    stroke: new ol.style.Stroke({
                        width: 3,
                        color: strokeColors[colorIndex]
                    })
                });
                return style;
            }
        }
    });

    //定位人员
    $('#btnPersonPosition').click(function () {
        showUserPoint([93982.361898669, 41441.333051760004]);
    });

    //删除人员
    $('#btnRemovePersonPosition').click(function () {
        //删除方法一：userOverlay.clear();
        //删除方法二：因为将定位的人员单独归为了一个图层，除了调用clear方法，还可以使用指定的ID来删除
        var overlayex = userOverlay.getOverlayexById("guid")
        if (overlayex) {
            userOverlay.removeOverlayex(overlayex);
        }
    });


    var pushpinTool = new TyMapUtils.PushpinTool(TyMap.getMap(),
   {
       markerEndCallback: function (pos) {
           var txt = $('#txtInfo').val();
           $('#txtInfo').val(txt + "[" + pos[0] + "," + pos[1] + "],");
       }
   });

    $('#btnSelectPos').click(function () {
        pushpinTool.start();
    });

    $('#btnCloseSelectPos').click(function () {
        pushpinTool.close();
    });

    //动画效果的覆盖物
    var animateOverlayex;
    $('#btnCss3').click(function () {
        debugger;
        if (animateOverlayex == undefined) {
            var target = "<div id=\"css_animation\"></div>";
            target = $(target).appendTo($("body"));

            animateOverlayex = new TyMapUtils.Overlayex({
                position: [99982.361898669, 25441.333051760004],//x:93982.361898669 y:41441.333051760004
                container: target[0],
                offset: [-25, -25],
                //positioning : "center-center"
            });
            TyMap.getMap().addOverlay(animateOverlayex.createOverlay());
            animateOverlayex.addEventListener('click', function () {
                //console.log(this);//this是marker的dom节点
                alert("animateOverlayex clicked");
            });
        }
    });

    $('#btnVehiclePositions').click(function () {
        if (carOverlay.getCount() > 0) {
            return;
        }
        var i = 0, count = 50;
        var vehicles = [];
        for (i = 0; i < count; i++) {
            vehicles.push(
                {
                    id: i,
                    name: "name" + i,
                    gpsDate: "2015-12-28 13:28",
                    speed: 50 + i,
                    lng: 501740 + Math.floor(Math.random() * 80 + 1),//[91675.90421699999,39643.634256]
                    lat: 2494462 - Math.floor(Math.random() * 90 + 1),
                    status: "status",
                    clientKey: "clientKey",
                    fileId: "fileId"
                });
        }

        $.each(vehicles, function (i, vechicle) {
            var icon = new TyMapUtils.Icon("images/car.png", [46, 30], { offset: [1, 1] });
            var label = new TyMapUtils.Label("姓名：" + vechicle.name, { offset: [0, -20], style: { backgroundColor: "#4a86e8", fontSize: 12, fontName: "arial" } });
            var marker = new TyMapUtils.Marker({
                id: "guid" + vechicle.id,
                position: [vechicle.lng, vechicle.lat],
                icon: icon,
                label: label,
                offset: [-23, -15]
            });
            marker.setFlag(vechicle);
            carOverlay.addOverlayex(marker);
            marker.addEventListener('click', function (marker,e) {

                //测试修改图标；
                marker.icon.setImage("images/car_offline.png");
                //打开popup
                var sContent =
                   '<div class="TUI-title">' +
                   ' <span class="TUI-ico ico-note"></span><strong id="infoTitle"></strong>' +
                   '</div>' +
                   '<table cellpadding="0" cellspacing="0" border="0" class="TUI-grid-info TUI-grid-th-right" width="100%">' +
                   ' <colgroup>' +
                   '    <col width="80px">' +
                   '    <col>' +
                   ' </colgroup>' +
                   ' <tr><th>电话：</th><td><span id="lblClientKey"></span></td><td colspan="2" rowspan="4" style="text-align:center"><img id="imgPoto" src="images/default_car.png" /></td></tr>' +
                   ' <tr><th>单位：</th><td><span id="lblDept"></span></td></tr>' +
                   ' <tr><th>类型：</th><td><span id="lblCarType"></span></td></tr>' +
                   ' <tr><th>定位时间：</th><td><span id="lblGPSDate"></span></td></tr>' +
                   ' <tr><th>速度：</th><td><span id="lblSpeed"></span></td><th>状态：</th><td><span id="lblStatus"></span></td></tr>' +
                   '<tr><td colspan="4" style="text-align:center"><input type="button" id="btnGpsPlay" class="TUI-button" value="轨迹播放"></input>  <input type="button" id="btnShowInfo" class="TUI-button" value="详细信息"></input>  <input type="button" id="btnTracke" class="TUI-button" value="追踪"></input></td></tr>' +
                   '</table>';
                var popup = new TyMapUtils.Popup(sContent, { width: 400, height: 180 });  // 创建信息窗口对象
                marker.openPopup(TyMap.getMap(),popup);
                $('#infoTitle').text(marker.flag.name);
                $('#lblClientKey').text(marker.flag.clientKey);
                $('#lblGPSDate').text(marker.flag.gpsDate);
                $('#lblSpeed').text(marker.flag.speed);
                $('#lblDept').text(marker.flag.dept);
                $('#lblStatus').text(marker.flag.status);

                $('#btnGpsPlay').click(function () {
                    popup.dispose();//关闭infowindow;            
                    trackOverlay.clear();

                    var points = [[86454.91911201301, 32848.821073857005], [86694.35979546602, 32848.821073857005],
                    [86951.05367403601, 32903.105517029995], [87047.41908090902, 32932.983001256995],
                    [87155.98796725502, 32910.680090496004], [87372.28412067301, 32850.504312405],
                    [87454.762809525, 32829.884640192], [87570.90626933699, 32792.853392136],
                    [87679.475155683, 32772.65452956], [88094.81426740199, 32751.614047710005],
                    [88299.74856062102, 32741.093806785], [88527.40657423802, 32737.306520052],
                    [88714.66686270302, 32709.533084010003], [89073.61748306402, 32654.827831200007],
                    [89215.85114037001, 32637.995445720004], [89397.64090355401, 32631.262491528003],
                    [89772.16148048402, 32629.158443342996], [90187.07978256601, 32622.004679514],
                    [90457.66037915701, 32630.841681891], [90572.96221969501, 32651.461354103998],
                    [90820.819095888, 32733.940042955997], [91031.22391438799, 32853.870789501],
                    [91186.502670441, 32948.132148189005], [91324.10742174, 32991.896350437004],
                    [91480.648606704, 32999.050114266], [91561.44405700799, 32992.317160073995],
                    [91744.91705874001, 32967.91020112801], [92095.451486361, 33030.61083704101],
                    [92376.55232387701, 33095.836330776], [92507.00331134701, 33088.682566947],
                    [92860.90421606402, 32989.371492615], [92790.629006685, 33198.09307256701]
                    ];
                    var polyLineStyle = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            width: 6,
                            color: "#00FF00"
                        })
                    });
                    var line = trackOverlay.addLineString(points, polyLineStyle);

                    //起点；
                    var startStyle = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                            anchor: [0.5, 43],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            opacity: 0.75,
                            src: 'images/start_point.png'
                        }))
                    });
                    trackOverlay.addPoint(points[0], startStyle);

                    //终点
                    var endStyle = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                            anchor: [0.5, 43],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            opacity: 0.75,
                            src: 'images/end_point.png'
                        }))
                    });
                    trackOverlay.addPoint(points[points.length - 1], endStyle);
                    TyMap.fit(line.getGeometry());//合适的缩放级别显示轨迹；

                    //播放轨迹
                    var carStyle = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                            anchor: [0.5, 0.5],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            opacity: 0.75,
                            src: 'images/car_play.png',
                            //offset:[]
                        }))
                    });
                    var index = 0;
                    var car = trackOverlay.addPoint(points[index], carStyle);

                    var gpsTraceStyle = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            width: 6,
                            color: "#FFFF00"
                        })
                    });
                    var gpsTrace = trackOverlay.addLineString([], gpsTraceStyle);

                    gpsTrace.getGeometry().appendCoordinate(points[index]);//绘制行驶路线；
                    var track_label_newId = 'indictor_layer' + (new Date()).getTime().toString();
                    var label = new TyMapUtils.Label("车牌：" + marker.flag.name + "<br>速度：" +
                        marker.flag.speed,
                        {
                            id: track_label_newId,
                            offset: [12, -5],
                            style: { backgroundColor: "#ffffff", fontSize: 12, fontName: "arial" }
                        });
                    TyMap.getMap().addOverlay(label.createOverlay());
                    //动画
                    function timerTick() {
                        if (points.length - 1 > index) {
                            var firstPoint = points[index];
                            var nextPoint = points[++index];

                            gpsTrace.getGeometry().appendCoordinate(nextPoint);//绘制行驶路线；
                            //绘制行驶车
                            var rotate = TyMap.getRotation(firstPoint, nextPoint);
                            carStyle.getImage().setRotation(rotate);//改变方向  //car.setStyle(carStyle);
                            car.getGeometry().setCoordinates(nextPoint);//改变位置;
                            //更新label
                            label.setContent("车牌：" + marker.flag.name + "<br>速度：" + (30 + Math.floor(Math.random() * 80 + 1)));
                            label.setPosition(nextPoint);

                            timer = setTimeout(function () {
                                timerTick();
                            }, 200);
                        }
                    }
                    var timer = setTimeout(function () {
                        timerTick();
                    }, 200);


                });
                $('#btnShowInfo').click(function () {
                    alert("btnShowInfo");
                });
                $("#btnTracke").click(function () {
                    alert("btnTracke");
                });
            });
        });
    });

    $('#btnClearVehiclePositions').click(function () {
        carOverlay.clear();
        trackOverlay.clear();
    });

    $('#btnClearVectorIcon').click(function () {
        largeOverlay.clear();
    });

    //加载海量矢量图标
    $('#btnTestVectorIcon').click(function () {
        var i = 0, count = 10000;
        var fill = new ol.style.Fill(
                    {
                        color: 'rgba(255, 255, 0, 0.4)'
                    });
        var stroke = new ol.style.Stroke({
            width: 4,
            color: "#FFCC00"
        });
        var iconStyle = new ol.style.Style({
            //填充色
            fill: fill,
            //边框色
            stroke: stroke,
            image: new ol.style.Circle({
                fill: fill,
                stroke: stroke,
                radius: 1
            })
        });

        for (i = 0; i < count; i++) {
            var coord = [83811.81372599998 + Math.floor(Math.random() * 35000 + 1), 49716.13372049999 - Math.floor(Math.random() * 21000 + 1)];
            var feature = largeOverlay.addPoint(coord, iconStyle, "largeData" + i);
        }

        //单击事件
        var selectStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                opacity: 0.75,
                src: 'images/baidu_pt_mark.png'
            }))
        })
        var selectClick = new ol.interaction.Select({
            condition: ol.events.condition.click,
        });
        var prevSelectFeatrue = null;
        TyMap.getMap().addInteraction(selectClick);
        selectClick.on('select', function (e) {
            $('#status').html('&nbsp;' + e.target.getFeatures().getLength() +
                ' selected features (last operation selected ' + e.selected.length +
                ' and deselected ' + e.deselected.length + ' features)');
            if (prevSelectFeatrue) {
                prevSelectFeatrue.setStyle(iconStyle);
            }
            if (e.target.getFeatures().getLength() > 0) {
                var feature = e.target.getFeatures().item(0);
                feature.setStyle(selectStyle);
                prevSelectFeatrue = feature;
                alert("单击事件");
            }
        });
    });

   

    //画多边形
    $('#btnTestPolyLine').click(function () {
        var style = new ol.style.Style({
            ////填充色
            fill: new ol.style.Fill(
                {
                    color: [0xff, 0x00, 0xff, 0.1]//"#ff00ff"
                }),
            //边框色
            stroke: new ol.style.Stroke({
                width: 6,
                color: "#FFFF00"
            })
        });
        //[73452.1945123315, -4201.0304896007365, 183765.19611266855, 63193.84282853833];
        var extent = TyMap.getExtent();
        var feature = new ol.Feature({
            geometry: new ol.geom.Polygon([[
                [extent[0], extent[1]],
                [extent[2], extent[1]],
                [extent[2], extent[3]],
                [extent[0], extent[3]],
                [extent[0], extent[1]]
            ]])
        });
        feature.setId("Polygon");
        feature.setStyle(style);
        largeOverlay.addFeature(feature);
    });

    //画圆
    $('#btnTestCircle').click(function () {
        var style = new ol.style.Style({
            //填充色
            fill: new ol.style.Fill(
                {
                    color: "#ff00ff"
                }),
            //边框色
            stroke: new ol.style.Stroke({
                width: 6,
                color: "#FFFF00"
            })
        });

        var feature = largeOverlay.addCircle([108608.69531250003, 29496.4061694688], 1000, style, "Circle");
    });

    //框选
    var selectStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 0.75,
            src: 'images/baidu_pt_mark.png'
        }))
    });
    var dragBox = new TyMapUtils.DragBox(TyMap.getMap(), selectStyle, function (bbox, selectedFeatures) {
        $('#status').html(selectedFeatures.getLength() + " features selected!");
    }, largeOverlay.getVectorLayer());
    $('#btnBoxSelect').click(function () {
        dragBox.getFeatures();
    });
    $('#btnCloseBoxSelect').click(function () {
        dragBox.close();
    });

    //手动绘制几何图形；
    var typeSelect = $('#type');
    var drawTool = new TyMapUtils.DrawTool(TyMap.getMap(), new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 3
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    }));
    typeSelect.change(function () {
        var value = typeSelect.val();
        drawTool.start(value, function (event) {
            var feature = event.feature;
            var geom = feature.getGeometry();
            var pos = geom.getLastCoordinate();
        });
    });

    $('#btnClearDraw').click(function () {
        drawTool.clear();
    });

    //测距、测面；
    var measureTool = new TyMapUtils.MeasureTool(TyMap.getMap());
    $('#btnMeasureLength').click(function () {
        if (!measureTool) {
            measureTool = new TyMapUtils.MeasureTool(TyMap.getMap());
        }
        measureTool.start('length');
    });

    $('#btnMeasureArea').click(function () {
        if (!measureTool) {
            measureTool = new TyMapUtils.MeasureTool(TyMap.getMap());
        }
        measureTool.start('area');
    });

    $('#btnCloseMeasure').click(function () {
        measureTool.close();
        measureTool = null;
    });

    //聚集
    var clusters = null;
    $('#btnClustering').click(function () {

        //矢量数据
        var source = new ol.source.Vector({
        });
        //插入测试坐标点
        var count = 20000;
        var features = new Array(count);
        var x = 183765.19611266855;
        var y = 63193.84282853833;
        for (var i = 0; i < count; ++i) {
            var coordinates = [2 * x * Math.random() - x, 2 * y * Math.random() - y];
            features[i] = new ol.Feature(new ol.geom.Point(coordinates));
        }
        source.addFeatures(features);
        //聚集
        var clusterSource = new ol.source.Cluster({
            distance: 50, //
            source: source
        });
        //layer
        var styleCache = {};
        clusters = new ol.layer.Vector({
            source: clusterSource,
            style: function (feature, resolution) {
                //console.log(feature.get('features'));
                var size = feature.get('features').length;
                var style = styleCache[size];
                if (!style) {
                    style = [new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 10,
                            stroke: new ol.style.Stroke({
                                color: '#fff'
                            }),
                            fill: new ol.style.Fill({
                                color: '#3399CC'
                            })
                        }),
                        text: new ol.style.Text({
                            text: size.toString(),
                            fill: new ol.style.Fill({
                                color: '#fff'
                            })
                        })
                    })];
                    styleCache[size] = style;
                }
                return style;
            }
        });
        TyMap.getMap().addLayer(clusters);
    });

    $('#btnCloseClustering').click(function () {
        if (clusters) {
            TyMap.getMap().removeLayer(clusters);
        }
    });

    //热力图
    var heatmap;
    $('#btnHeatmap').click(function () {
        heatmap = new ol.layer.Heatmap({
            source: new ol.source.Vector({
            }),
            blur: 25, /* 模糊因子，适用于所有的数据点。默认为0.85。模糊因子越高，梯度就越平滑。也就是做放射颜色渐变时的内圆半径越小。*/
            radius: 15//点半径
        });

        //插入测试坐标点
        var count = 10000;
        var features = new Array(count);
        var x = 183765.19611266855;
        var y = 63193.84282853833;
        for (var i = 0; i < count; ++i) {
            var coordinates = [2 * x * Math.random() - x, 2 * y * Math.random() - y];
            features[i] = new ol.Feature(new ol.geom.Point(coordinates));
        }
        heatmap.getSource().addFeatures(features);

        TyMap.getMap().addLayer(heatmap);

        //heatmap.getSource().on('addfeature', function (event) {
        //    // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
        //    // standards-violating <magnitude> tag in each Placemark.  We extract it from
        //    // the Placemark's name instead.
        //    var name = event.feature.get('name');
        //    var magnitude = parseFloat(name.substr(2));
        //    event.feature.set('weight', magnitude - 5);
        //});
    });

    $('#btnCloseHeatmap').click(function () {
        if (heatmap) {
            TyMap.getMap().removeLayer(heatmap);
        }
    });


    //export map，需要浏览器支持；
    $('#btnExportmap').click(function () {
        TyMap.getMap().once('postcompose', function (event) {
            var canvas = event.context.canvas;
            //exportPNGElement.href = canvas.toDataURL('image/png');
            $('#btnExportmap')[0].href = canvas.toDataURL('image/png');
        });
        TyMap.getMap().renderSync();
    });
});










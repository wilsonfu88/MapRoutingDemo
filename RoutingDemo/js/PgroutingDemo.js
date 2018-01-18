

var format = 'image/png';
var bounds = [501369.9375, 2494100.25,
    502073, 2495256.25];


var startLine = null, endLine = null;

var mousePositionControl = new ol.control.MousePosition({
    className: 'custom-mouse-position',
    target: document.getElementById('location'),
    coordinateFormat: ol.coordinate.createStringXY(5),
    undefinedHTML: '&nbsp;'
});

var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
})

var lineLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
});



function addPointFeature(point, imageUrl) {
    var anchor = new ol.Feature({
        geometry: new ol.geom.Point(point)
    });

    anchor.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            src: imageUrl
        })
    }));
    vectorLayer.getSource().addFeature(anchor);

    return anchor;
}


var tiled = new ol.layer.Tile({
    visible: true,
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/pg_ws/wms',
        params: {
            'FORMAT': format,
            'VERSION': '1.1.1',
            tiled: true,
            STYLES: '',
            LAYERS: 'pg_ws:xmpark_road',
        }
    })
});

var cross_tiled = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/pg_ws/wms',
        params: {
            'FORMAT': format,
            'VERSION': '1.1.1',
            tiled: true,
            STYLES: '',
            LAYERS: 'pg_ws:xmpark_road_vertices_pgr',
        }
    })
});

var projection = new ol.proj.Projection({
    code: 'EPSG:3857',
    units: 'm',
    axisOrientation: 'neu',
    global: true
});
var map = new ol.Map({
    controls: ol.control.defaults({
        attribution: false
    }).extend([mousePositionControl]),
    target: 'map',
    layers: [
        tiled, cross_tiled, vectorLayer, lineLayer
    ],
    view: new ol.View({
        projection: projection
    })
});


map.getView().fit(bounds, map.getSize());

var routeLayer = null;

function queryRoute() {
    if (routeLayer != null) {
        map.removeLayer(routeLayer);
    }

    var val1 = $("#id1").val();
    var val2 = $("#id2").val();
    routeLayer = new ol.layer.Tile({
        visible: true,
        source: new ol.source.TileWMS({
            url: 'http://localhost:8080/geoserver/pg_ws/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.1',
                tiled: true,
                STYLES: '',
                LAYERS: 'pg_ws:xmpark_road_route',
                'viewparams': 'a:' + val1 + ';b:' + val2
            }
        })
    });

    map.addLayer(routeLayer);
}

$(function () {
    $("#map").height(document.body.scrollHeight - 80);

    $("#btnGetPoint").on("click", function () {
        map.removeEventListener("singleclick");
        map.addEventListener("singleclick", function (event) {
            console.log(event.coordinate);
            $("#spanResult").html("获取点坐标为：" + /*proj4('EPSG:3857', 'EPSG:4326', event.coordinate).join(",") + "| 平面坐标为：" +*/ event.coordinate.join(","));
        });

    });



    var feature_start = addPointFeature([501227.6565745276, 2495205.3103999062], "img/start_point.png");
    var feature_end = addPointFeature([501740.64295257954, 2495076.467309605], "img/end_point.png");


    var moddify_start = new ol.interaction.Modify({
        features: new ol.Collection([feature_start]),
        style: null,
        pixelTolerance: 50
    });

    var moddify_end = new ol.interaction.Modify({
        features: new ol.Collection([feature_end]),
        style: null,
        pixelTolerance: 50
    });


    moddify_start.on('modifyend', function (evt) {
        var point = evt.mapBrowserPointerEvent.coordinate;
        $("#spanStart").html(point.join(","));
        getPointNearby(point[0], point[1], "id1","txtPointStart");
    }, feature_start);


    moddify_end.on('modifyend', function (evt) {
        var point = evt.mapBrowserPointerEvent.coordinate;
        getPointNearby(point[0], point[1], "id2","txtPointEnd");
        //console.log(evt.mapBrowserPointerEvent.coordinate.join(","));
        $("#spanEnd").html(evt.mapBrowserPointerEvent.coordinate.join(","));
    }, feature_end);



    map.addInteraction(moddify_start);
    map.addInteraction(moddify_end);
})


//根据坐标点获取拓扑网络中的导航点
function getPointNearby(x, y, eleId,pointId) {
    $.ajax({
        type: "get",
        url: "ashx/DataHandler.ashx",
        data: { "x": x, "y": y },
        success: function (data) {
            $("#" + eleId).val(data.Id);
            $("#" + pointId).val(data.X + "," + data.Y);
            var isStart = eleId == "id1";
            drawLine(x, y, data.X, data.Y, isStart);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(textStatus);
        }
    })
}
//绘制导航起止线
function drawLine(x1, y1, x2, y2, isStart) {
    var style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: '#0044CC'
        }),
        stroke: new ol.style.Stroke({
            lineDash: [1, 2, 3, 4, 5, 6],
            color: '#0044CC',
            width: 4
        })
    });
    if (isStart) {
        if (startLine != null) {
            lineLayer.getSource().removeFeature(startLine);
        }
        startLine = new ol.Feature({
            geometry: new ol.geom.LineString([[x1, y1], [x2, y2]], "XY")
        });
        startLine.setStyle(style);
        lineLayer.getSource().addFeature(startLine);
    }
    else {
        if (endLine != null) {
            lineLayer.getSource().removeFeature(endLine);
        }
        endLine = new ol.Feature({
            geometry: new ol.geom.LineString([[x1, y1], [x2, y2]], "XY")
        });
        endLine.setStyle(style);
        lineLayer.getSource().addFeature(endLine);
    }
}

//获取要素的wkt
//http://openlayers.org/en/latest/apidoc/ol.format.html
function getWKT(yourFeature) {
    if (yourFeature != null) {
        var format = new ol.format.WKT();
        return format.writeGeometry(yourFeature.getGeometry());
    }
    return "";
}

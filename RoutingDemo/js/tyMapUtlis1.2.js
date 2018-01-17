


function TyMapUtils() {
    /*
    私有成员
    */
    var _map, _extent, _center, _resolutions, _tileSize, _overlayexLayers = {};

    //EPSG:3857  球面墨卡托投影在官方指定的代码为EPSG：3857。但是在官方发布之前，很多软件已经使用了EPSG：900931代码来表示该投影
    //ol3只支持4326,3857两种，其余投影利用proj4.js2.2版本以上支持；
    //proj4.defs("EPSG:2415", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=39500000 +y_0=0 +ellps=krass +towgs84=15.8,-154.4,-82.3,0,0,0,0 +units=m +no_defs");
    //var _projectionExtent = [35918242.81, 4915747.10, 37089858.23, 5077965.93];
    proj4.defs("EPSG:4547", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");

    //var _proj = new ol.proj.Projection({
    //    code: 'EPSG:2415',
    //    units: 'm',
    //    axisOrientation: 'neu',
    //    //extent: _projectionExtent
    //});
    var _proj = ol.proj.get("EPSG:4547");
    ol.proj.addProjection(_proj);
    //_proj = ol.proj.get("EPSG:3857");

    /*  创建一个TyMapUtils.OverlayexLayer的图层实例
      opt = {
            id,//图层ID
            map,//ol.map实例
            overlayexs，//array<Overlayex>
        }
    */
    function innerCreateOverlayexLayer(opt) {
        var layer = new TyMapUtils.OverlayexLayer(opt);
        _overlayexLayers[opt.id] = layer;
        return layer;
    }

    /*
    根据对象删除OverlayexLayer图层
    overlayexLayer：TyMapUtils.OverlayexLayer实例
    */
    function innerRemoveOverlayexLayer(overlayexLayer) {
        if (overlayexLayer) {
            overlayexLayer.clear();
            delete _overlayexLayers[overlayexLayer.getId()];
        }
    }

    /*
    通过OverlayexLayer图层的ID删除OverlayexLayer图层
    layerId:OverlayexLayer的图层ID
    */
    function innerRemoveOverlayexLayerById(layerId) {
        if (layerId !== undefined) {
            var layerex = _overlayexLayers[layerId.toString()];
            if (layerex) {
                layerex.clear(); //在清除marker图层前，必须先销毁其子元素(Overlayex)
            }
            delete _overlayexLayers[layerId.toString()];
        }
    }

    /*
    删除所有的OverlayexLayer图层
    */
    function innerClearOverlayexLayers() {
        for (var item in _overlayexLayers) {
            if (item) {
                removeOverlayexLayerById(item);
            }
        }
    }

    /*
    通过OverlayexLayer图层的ID，获取特定的OverlayexLayer图层
    */
    function innerGetOverlayexLayer(id) {
        var returnLayers = null;
        if (id !== undefined) {
            returnLayers = _overlayexLayers[id.toString()];
        }
        return returnLayers;
    }

    /*
    获取所有的OverlayexLayer图层
*/
    function innerGetAllOverlayexLayer() {
        return _overlayexLayers;
    }

   /*
    地图相关
    */
    function getTileGrid() {
        return new ol.tilegrid.TileGrid({
            resolutions: _resolutions,
            tileSize: _tileSize,
            extent: _extent
        });
    };

    //底图
    function getBaseLayer() {
        return new ol.layer.Tile({
            source: getBaseLayerSource(),
            //preload: 1,//预加载一个级别；//Preload. Load low-resolution tiles up to preload levels. By default preload is 0, which means no preloading.
            //extent: _extent
        });
    };

    //底图Source
    function getBaseLayerSource() {
        /*return new ol.source.TileImage({
            projection: _proj,
            tileGrid: getTileGrid(),
            tileUrlFunction: function (tileCoord, pixelRatio, proj) {
                var z = tileCoord[0];
                var x = tileCoord[1];
                var y = tileCoord[2];
                var fullView = [987, 658]; // _map.getSize;//
                var url = "http://220.112.204.184:9090/Topevery.ArcGIS.Web.GAS/Handlers/MapPublishHostImage.aspx?group=dgumV2Web&service=szGas_XC&version=-1&fullView=0,0," + fullView[0] + "," + fullView[1] + "&zoomLevel=" + (Math.pow(2, z)) + "&tileSize=" + _tileSize[0] + "," + _tileSize[1] + "&tileIndex=" + (x) + "," + (-y - 1) + "&cfgVersion=0";
                return url;
            },
            wrapX: false
        });*/

        var tileGrid = new ol.tilegrid.TileGrid({
            tileSize: 256,
            origin: [-5123200, 10002100],
            extent: _extent,
            resolutions: _resolutions
        });

        return new ol.source.XYZ({
            projection: _proj,
            tileGrid: tileGrid,
            tileUrlFunction: function (tileCoord, pixelRatio, proj) {
                //console.log("x:" + tileCoord[1] + "  y:" + tileCoord[2] + " z:" + tileCoord[0] + " YFix:" + yFixs[tileCoord[0] - 13]);
                var x = 'C' + padLeft(tileCoord[1], 8, 16);
                var y = 'R' + padLeft(-tileCoord[2] - 1, 8, 16);
                var z = 'L' + padLeft(tileCoord[0], 2, 10);
                var url = 'http://localhost/xmmap_title' + '/' + z + '/' + y + '/' + x + '.png';
                return url;


            }
        })
    };

    //view
    function getMapView() {
        return new ol.View({
            projection: _proj,  //最重要！！！
            extent: _extent,
            center: _center,
            resolutions: _resolutions,
            enableRotation: false//不允许旋转地图；
        })
    };

     function padLeft(val,num ,radix) {
        var str = val.toString(radix || 10);
        return (new Array(num).join('0') + str).slice(-num);
    }

    function initConfig(opt) {
        _tileSize = [256, 256];
        _extent = [501196.08733384218, 2494007.5702734734, 502257.86237405892, 2495378.6438489538];
        _center = ol.extent.getCenter(_extent);
        _resolutions = [
           66145.965625264595,
            33072.982812632297,
            16933.367200067736,
            8466.6836000338681,
            4233.341800016934,
            2116.670900008467,
            1058.3354500042335,
            529.16772500211675,
            264.58386250105838,
            132.29193125052919,
            66.145965625264594,
            33.072982812632297,
            16.933367200067735,
            8.4666836000338677, 4.2333418000169338, 2.1166709000084669, 1.0583354500042335, 1, 0.52916772500211673, 0.26458386250105836, 0.13229193125052918
        ];
        /*
        scales:
        407158.3943442441
        203579.19717212205
        101789.59858606102
        50894.79929303051
        25447.399646515256
        12723.699823257628
        6361.849911628814
        3180.924955814407
        1590.4624779072035
        单位：1m:米
        dpi = 96
        两者的转换关系是：scale = resolution * 96 * 39.3701（1米=39.3701英寸，1英寸=96像素(DPI=96)）
        dpi是指每英寸的像素，也就是扫描精度
        resolution = scale / 96 / 39.3701

        1m = 39.3701英寸 * 96像素 = N pix;
        10000 * 39.3701英寸 * 96像素 / 90 ;  
        */
    };

    function createMap(target /*div*/) {
        _map = new ol.Map({
            target: target,
            controls: ol.control.defaults(
                {
                    zoom : false
                }
                ).extend([
            //new ol.control.ScaleLine(),//比率尺
                new TyMapUtils.ScaleLine(),
                new ol.control.ZoomSlider(), //缩放级别
                new ol.control.FullScreen(), //全屏显示
                //getOverviewMapControl(), //鹰眼
            //new ol.control.ZoomToExtent(),//缩放到某一范围
            ]),
            logo: false, //不显示logo
            layers: [
                getBaseLayer()
                ,  ////调试瓦片
                //new ol.layer.Tile({
                //    source: new ol.source.TileDebug({
                //        projection: _proj,
                //        tileGrid: getTileGrid(),
                //    })
                //})
            ],
            view: getMapView()
        });
        _map.getView().fit(_extent, _map.getSize());
        //保存历史视图
        _map.on('moveend', saveHistoryViewExtent);
    };

    //鹰眼
    function getOverviewMapControl() {
        //return new ol.control.CustomOverviewMap({
        ol.OVERVIEWMAP_MIN_RATIO = 0.1;
        ol.OVERVIEWMAP_MAX_RATIO = 0.5;
        return new ol.control.OverviewMap({
            // see in overviewmap-custom.html to see the custom CSS used
            className: 'ol-overviewmap ol-custom-overviewmap',
            layers: [
                getBaseLayer(), //这里应该用鹰眼的瓦片代替!!!!!!!!!!!!!
            ],
            collapseLabel: '\u00BB',
            label: '\u00AB',
            collapsed: false,
            view: new ol.View({
                resolutions: _resolutions,
                projection:_proj,
                extent: ol.extent.buffer(_extent, -100000),
                center: _center,
                zoom: 13,
                minZoom: 13,
                maxZoom: 20
                //enableRotation: false,//不允许旋转地图；
            })
        });
    };

    function fit(extentOrGeometry) {
        _map.getView().fit(extentOrGeometry, _map.getSize());
    };

    function fitByFeatures(features) {
        if (features) {
            var extent = ol.extent.createEmpty();
            features.forEach(function (feature) {
                ol.extent.extend(extent, feature.getGeometry().getExtent());
            })
            map.getView().fit(extent, map.getSize());
        }
    }

    var historyView = [];
    var isAllowUpdateHistory = true;
    var maxHistory = 10;
    var historyIndex;

    function saveHistoryViewExtent(e) {
        if (isAllowUpdateHistory) {
            var viewExtent = _map.getView().calculateExtent(_map.getSize());
            historyView.push(viewExtent);
            if (historyView.length > maxHistory) {
                historyView.splice(0, 1);
            }
            historyIndex = historyView.length - 1;
        }
        isAllowUpdateHistory = true;
    }

    function gotoPrevView() {
        if (historyView.length > 0) {               
            --historyIndex;
            if (historyIndex < 0) {
                historyIndex = 0; return;
            }
            //map.un('moveend', saveHistoryViewExtent);
            isAllowUpdateHistory = false;
            fit(historyView[historyIndex]);
        }
    }

    function gotoNextView() {
        if (historyView.length > 0) {
            ++historyIndex;
            if (historyIndex >= historyView.length-1) {
                historyIndex = historyView.length - 1; return;
            }
            //map.un('moveend', saveHistoryViewExtent);
            isAllowUpdateHistory = false;
            fit(historyView[historyIndex]);
        }
    }

    return {
        //管理Overlayex图层
        createOverlayexLayer: innerCreateOverlayexLayer,
        getOverlayexLayer: innerGetOverlayexLayer,
        getAllOverlayexLayer: innerGetAllOverlayexLayer,
        removeOverlayexLayer: innerRemoveOverlayexLayer,
        removeOverlayexLayerById: innerRemoveOverlayexLayerById,
        clearOverlayexLayers: innerClearOverlayexLayers,

        //管理矢量图层的实例
        createFeatureLayer: function (opt) {
            return new TyMapUtils.FeatureLayer(opt);
        },

        //以下方法是跟地图对象相关的
        getMap: function () {
            return _map;
        },
        getExtent: function () {
            return _extent;
        },
        getCenter: function () {
            return _center;
        },
        getResolutions: function () {
            return _resolutions;
        },
        getBaseLayer: getBaseLayer,
        //按最优级别显示某个范围或某个Geometry;
        fit:fit,
        //放大
        zoomIn: function () {
            var view = _map.getView();
            var zoom = view.getZoom();
            view.setZoom(zoom + 1);
        },
        //缩小
        zoomOut: function () {
            var view = map.getView();
            var zoom = view.getZoom();
            view.setZoom(zoom - 1);
        },
        //缩放到全图
        zoomToFull:function()
        {
            fit(_extent);
        },
        //左移半屏
        moveToLeft: function () {
            var view =  _map.getView();
            var resolution = view.getResolution();
            var size = _map.getSize();
            var center = view.getCenter();
            center[0] = center[0] - (size[0] * resolution) / 2;
            view.setCenter(center);
        },
        //右移半屏
        moveToRight: function () {
            var view = _map.getView();
            var resolution = view.getResolution();
            var size = _map.getSize();
            var center = view.getCenter();
            center[0] = center[0] + (size[0] * resolution) / 2;
            view.setCenter(center);
        },
        //上移半屏
        moveToUp: function () {
            var view = _map.getView();
            var resolution = view.getResolution();
            var size = _map.getSize();
            var center = view.getCenter();
            center[1] = center[1] - (size[1] * resolution) / 2;
            view.setCenter(center);
        },
        //下移半屏
        moveToDown: function () {
            var view = _map.getView();
            var resolution = view.getResolution();
            var size = _map.getSize();
            var center = view.getCenter();
            center[1] = center[1] + (size[1] * resolution) / 2;
            view.setCenter(center);
        },
        //前视图
        gotoPrevView : gotoPrevView,
        //后视图
        gotoNextView:gotoNextView,
        //初始化配置
        initConfig: initConfig,
        //创建地图
        createMap: createMap,

        //获取一个点跑另一个点的方向
        getRotation: function (start, end) {
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var rotation = Math.atan2(dy, dx);
            return rotation;
        },
        getVersion: function () {
            return "1.2";
        },
    }
};

//ol.inherits = function (childCtor, parentCtor){
//    childCtor.prototype = Object.create(parentCtor.prototype);
//    childCtor.prototype.constructor = childCtor;
//};


/*
  封装的矢量图层FeatureLayer
  opt :
  {
      style ,//ol.style.Style
      map, //ol.map
      features,//ol.collection
     其余参数参考ol.layer.Vector 对象的构造参数opt_options
  }    
  */
TyMapUtils.FeatureLayer = function (opt) {
    var map = opt.map;
    var vectorLayerSource = new ol.source.Vector({ wrapX: false, features: opt.features });
    var vectorLayer = new ol.layer.Vector({
        source: vectorLayerSource,
        style: opt.style        
    });
    map.addLayer(vectorLayer);

    return {
        /*
       添加Feature
       feature : ol.feature实例
       */
        addFeature: function (feature) {
            vectorLayerSource.addFeature(feature);
            return feature;
        },
        /*
        插入一个Geomtry；
        */
        addGeomertry: function (geom,style, id, properties) {
            var feature = new ol.Feature(
                {
                    geometry: geom
                });
            if (id) {
                feature.setId(id);
            }
            if (properties) {
                feature.setProperties(properties, false);
            }
            if (style) {
                feature.setStyle(style);
            }
            return this.addFeature(feature);
        },
        /*
        插入一个点；
        */
        addPoint: function (point,style, id, properties) {
            var geom = new ol.geom.Point(point);
            return this.addGeomertry(geom, style, id, properties);
        },
        /*
        插入一条线；
        */
        addLineString: function (coordinates,style, id, properties) {
            var geom = new ol.geom.LineString(coordinates);
            return this.addGeomertry(geom, style, id, properties);
        },
        /*
        插入一个面；
        */
        addPolygon: function (coordinates,style, id, properties) {
            var geom = new ol.geom.Polygon(coordinates);
            return this.addGeomertry(geom, style, id, properties);
        },
        /*
            插入一个圆；
        */
        addCircle: function (centerPoint, radius,style, id, properties) {
            var geom = new ol.geom.Circle(centerPoint, radius);
            return this.addGeomertry(geom, style, id, properties);
        },
        /*
       删除指定的feature
       feature : ol.feature实例
        */
        removeFeature: function (feature) {
            vectorLayerSource.removeFeature(feature);
        },
        /*
        清除此图层中的所有feature
        */
        clear: function () {
            vectorLayerSource.clear();
        },
        /*
        通过指定ID查找对应的feature对象
        id : ol.feature的ID
        */
        getFeatureById: function (id) {
            return vectorLayerSource.getFeatureById(id);
        },
        //获取所有的ol.feature对象
        getFeatures: function () {
            return vectorLayerSource.getFeatures();
        },
        getVectorLayer:function()
        {
            return vectorLayer;
        },
        //解除矢量地层与地图的关联
        dispose: function () {
            map.removeLayer(this._featureLayer);
        }
    }
};

/*
  DOM元素的覆盖物Overlayex图层，用于在地图上显示DOM覆盖物
  opt = {
      id,//图层ID
      map, //ol.map实例
      overlayexs，//array<Overlayex>
  }
  */
//goog.provide('TyMapUtils.OverlayexLayer');
TyMapUtils.OverlayexLayer=function(opt) {
    var _internalOverlayexs = new ol.Collection();
    var _overlayexIdIndex_ = {};
    var layerId = opt.id || undefined;
    var map = opt.map;
    var overlayexs = opt.overlayexs || undefined;

    _internalOverlayexs.on('add', function (event) {
        var overlayex = event.element;
        if (overlayex.getId()) {
            _overlayexIdIndex_[overlayex.getId()] = overlayex;
        }
    }, this);

    _internalOverlayexs.on('remove', function (event) {
        var id = event.element.getId();
        if (id !== undefined) {
            delete _overlayexIdIndex_[id.toString()];
        }
    }, this);
       
    if (overlayexs && overlayexs.length > 0) {
        for (var i = 0; i < overlayexs.length; i++) {
            addOverlayex(overlayexs[i]);
        }
    }

    function addOverlayex(overlayex) {
        _internalOverlayexs.push(overlayex);
        map.addOverlay(overlayex.createOverlay());
    };

    function removeOverlayex(overlayex) {
        _internalOverlayexs.remove(overlayex);
        map.removeOverlay(overlayex.getOverlay());
    };

    function clear() {
        var overlayexs = _internalOverlayexs.getArray();
        for (var i = overlayexs.length - 1; i >= 0; i--) {
            removeOverlayex(overlayexs[i]);
        }
    };

    function getOverlayexById(id) {
        return _overlayexIdIndex_[id];
    };

    function getOverlayexs() {
        return _internalOverlayexs;
    }

    function getId() {
        return layerId;
    }

    return {
        //添加覆盖物到图层 overlayex:baseOverlayex
        addOverlayex: addOverlayex,
        //将集合中指定的marker进行移除
        removeOverlayex: removeOverlayex,
        //清除当前图层下的所有覆盖物
        clear: clear,
        //通过指定ID查找对应的覆盖物
        getOverlayexById: getOverlayexById,
        //获取此图层下的所有的覆盖物
        getOverlayexs: getOverlayexs,
        //获取图层自身的标识ID
        getId: getId,
        getCount:function()
        {
            return _internalOverlayexs.getLength();
        }
    }
};

/////////////////////扩展API/////////////////////////////

/*标注工具。此工具用来让使用者在地图上标注一个位置，可以通过该工具提供的事件来获得标注的位置。 
    //map : ol.map
    //layer : ol.layer 指定图层，如果不指定图层，则默认为所有图层
    //pushpinToolOptions
    //_marker 	overlayex 	标注所使用的图标，如果不设置，则使用默认的图标
    //cursor 	String 	标注所使用的鼠标样式。
    //followText 	String 	跟随鼠标移动的说明文字，默认为空。 
    //markerEndCallback  function(pos);//回调函数，标记完成后的回调函数；
*/
//goog.provide('TyMapUtils.PushpinTool');
TyMapUtils.PushpinTool = function (map, pushpinToolOptions,layer) {
    var layer = layer;
    var _marker = pushpinToolOptions.marker==undefined ? new TyMapUtils.Marker({
        icon: new TyMapUtils.Icon("images/myloc.png", [45, 75], { offset: [1, 1] }),
        label: new TyMapUtils.Label("选择位置", { offset: [40, 20], style: { backgroundColor: "#4a86e8", fontSize: 12, fontName: "arial" } }),
        offset: [-22, -65]
    }) : pushpinToolOptions.marker;

    var _cursor = pushpinToolOptions.cursor;
    var _followText = pushpinToolOptions.followText;
    var _map = map;
    var _markerEndCallback = pushpinToolOptions.markerEndCallback;
    var _selection = undefined;

    function _selectionListerner(e) {
        var overlay = _marker.getOverlay();
        pos = e.mapBrowserEvent.coordinate;
        if (!overlay) {
            _map.addOverlay(_marker.createOverlay());
        }
        _marker.getOverlay().setPosition(pos);
        _markerEndCallback(pos);
    }

    //开启标注工具。返回值如果为false，则表明开启失败，可能有其他工具正处于开启状态。请先关闭其他工具再进行开启。
    function start () {
        if (_selection == undefined) {
            _selection = new ol.interaction.Select(
                {
                    layers: [layer] //只针对底图;
                });
            var pos;            
            _map.addInteraction(_selection);
        }
        _selection.on('select', _selectionListerner);
        return true;
    }

    //close() 	none 	关闭标注工具。 
    function close() {
        if (_selection != null) {
            _selection.un('select', _selectionListerner);
            _map.removeInteraction(_selection);
            _selection = undefined;
            _marker.dispose();
        }
    }

    return {
        start : start,
        close : close,
    };
};

/*框选，按下ctrl+鼠标拖拽，可框选；
map : ol.map
selectedStyle : ol.style.Style
onSelected : callback回调方法
vectorLayer : ol.layer.vector
*/
//goog.provide('TyMapUtils.DragBox');
TyMapUtils.DragBox = function (map, selectedStyle, onSelected, olVectorLayer) {
    var _map = map;
    var _style = selectedStyle;
    var _vectorLayer = olVectorLayer;
    var _select = null;
    var _dragBox = null;
    var _onSelected = onSelected;

    //只要框的坐标
    function getBox() {
        // a DragBox interaction used to select features by drawing boxes
        _dragBox = new ol.interaction.DragBox({
            condition: ol.events.condition.platformModifierKeyOnly
        });
        _map.addInteraction(_dragBox);

        _dragBox.on('boxend', function (e) {
            var extent =_dragBox.getGeometry().getExtent();
            _onSelected(extent);
        });
    }

    //启动DragBox画框，vectorLayer在方框范围内的feature将以selectedStyle显示
    function getFeatures() {
        _select = new ol.interaction.Select({
            layers: [_vectorLayer],
            wrapX: false
        });
        _map.addInteraction(_select);
        var selectedFeatures =_select.getFeatures();

        // a DragBox interaction used to select features by drawing boxes
        _dragBox = new ol.interaction.DragBox({
            condition: ol.events.condition.platformModifierKeyOnly
        });
        _map.addInteraction(_dragBox);

        _dragBox.on('boxend', function (e) {
            var extent =_dragBox.getGeometry().getExtent();
            _vectorLayer.getSource().forEachFeatureIntersectingExtent(extent, function (feature) {
                selectedFeatures.push(feature);
                feature.setStyle(_style);
            });

            //if (selectedFeatures.getLength() > 0) {
            //   _onSelected(selectedFeatures);
            //}
            _onSelected(extent, selectedFeatures);
        });
    }

    function dispose() {
        if (_select) {
            _map.removeInteraction(_select);
            _select = undefined;
        }
        if (_dragBox) {
            _map.removeInteraction(_dragBox);
            _dragBox = undefined;
        }
    }

    return {
        getFeatures: getFeatures,
        getBox: getBox,
        dispose: dispose,
    };
};

//手工绘图工具
//goog.provide('TyMapUtils.DrawTool');
TyMapUtils.DrawTool = function (map/*ol.map*/, drawedStyle/*ol.style 绘制完成后的样式*/, sketchStyle/* ol.style 绘画时的样式，默认为空，用系统样式*/, modifyStyle/*ol.style 修改feature时的样式*/) {
    var _map = map;
    var _sketchStyle = sketchStyle;
    var _features = new ol.Collection();//很重要！！！

    var _vecSource = new ol.source.Vector({
        features: _features,
        useSpatialIndex: false,
        wrapX: false
    });
    var _vecLayer =new  ol.layer.Vector({
        style: drawedStyle,
        source: _vecSource,
        map: _map
    });
    var _draw = null;

    var _modify = new ol.interaction.Modify({
        features: _features,
        style: modifyStyle,
        // the SHIFT key must be pressed to delete vertices, so
        // that new vertices can be drawn at the same position
        // of existing vertices
        deleteCondition: function (event) {
            return ol.events.condition.shiftKeyOnly(event) &&
                ol.events.condition.singleClick(event);
        }
    });
    _map.addInteraction(_modify);

    var _overlayexLayer = new TyMapUtils.OverlayexLayer({
        id: 'TyMapUtils.DrawTool',
        map : _map
    });

    var start = function (type/*字符串：Point LineString Polygon Circle Square  Box*/, drawEndCallback/*ol.interaction.DrawEvent*/) {
        var value = 'None';
        value = type;

        if (_draw) {
            _draw.un("drawend", drawEndCallback);
            _map.removeInteraction(_draw);
        }
        addInteraction();

        function addInteraction() {
            if (value !== 'None') {
                var geometryFunction, maxPoints;
                if (value === 'Square') {
                    value = 'Circle';
                    geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
                } else if (value === 'Box') {
                    value = 'LineString';
                    maxPoints = 2;
                    geometryFunction = function (coordinates, geometry) {
                        if (!geometry) {
                            geometry = new ol.geom.Polygon(null);
                        }
                        var start = coordinates[0];
                        var end = coordinates[1];
                        geometry.setCoordinates([
                          [start, [start[0], end[1]], end, [end[0], start[1]], start]
                        ]);
                        return geometry;
                    };
                }
                _draw = new ol.interaction.Draw({
                    features: _features,
                    type: /** @type {ol.geom.GeometryType} */ (value),
                    geometryFunction: geometryFunction,
                    maxPoints: maxPoints,
                    style: _sketchStyle
                });
                if (_draw) {
                    _map.addInteraction(_draw);
                    _draw.on("drawend", function (e) {
                        //插入一个用于删除feature的X
                        var geom = e.feature.getGeometry();
                        var pos = geom.getLastCoordinate();
                        var label = new TyMapUtils.Label("✖", {
                            //id: newId,
                            position: pos,
                            offset: [-10, -10],
                            positioning: 'bottom-center',
                            style: { backgroundColor: "#ffffff", fontSize: 12, fontName: "arial" }
                        });
                        _overlayexLayer.addOverlayex(label);

                        //这里只能选择mousedown，并阻止其冒泡，因为绘画过程中，mousedown开始绘制，所以要防止；
                        label.addEventListener('mousedown', function (overlayex, evt) {
                            evt.stopEvent = true;//阻止冒泡；
                            _overlayexLayer.removeOverlayex(overlayex);
                            _features.remove(e.feature);
                        });
                        drawEndCallback(e);//调用回调函数 ；
                    });
                }
            }
        }
    }

    var clear = function () {
        _vecSource.clear();
        _overlayexLayer.clear();
    }

    var getFeatures = function () {
        return _vecSource.getFeatures();
    }

    var close = function () {
        if (_draw) {
            _map.removeInteraction(_draw);
            _draw = null;
        }
        if (_modify) {
            _map.removeInteraction(_modify);
            _modify = null;
        }
        _vecSource.clear();
        _map.removeLayer(_vecLayer);
        _overlayexLayer.clear();
    }

    return {
        start: start,
        clear: clear,
        close: close,
        getFeatures: getFeatures,
    };
};

//测距测面积工具
//goog.provide('TyMapUtils.MeasureTool');
TyMapUtils.MeasureTool = function (map) {
    var _map = map;
    //绘制后的样式；
    var style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    });

    var _vecSource = new ol.source.Vector({
        useSpatialIndex: false,
        wrapX: false
    });

    var _vecLayer = new ol.layer.Vector({
        style: style,
        map: _map,
        source: _vecSource
    });

    var _draw = null;
    var _overlayexs = new TyMapUtils.OverlayexLayer({
        id: 'TyMapUtils.MeasureTool',
        map: _map
    });

    /**
* Currently drawn feature.
* @type {ol.Feature}
*/
    var sketch;
    var sketchChangelistener;
    var helpTooltip;
    var measureTooltip;

    //鼠标移动时，tooltip跟随;
    /**
    * Handle pointer move.
    * @param {ol.MapBrowserEvent} evt
    */
    var pointerMoveHandler = function (evt) {
        if (evt.dragging) {
            return;
        }
        /** @type {string} */
        var helpMsg = 'Click to start drawing';

        var continuePolygonMsg = 'Click to continue drawing the polygon';
        var continueLineMsg = 'Click to continue drawing the line';

        if (sketch) {
            var geom = (sketch.getGeometry());
            if (geom instanceof ol.geom.Polygon) {
                helpMsg = continuePolygonMsg;
            } else if (geom instanceof ol.geom.LineString) {
                helpMsg = continueLineMsg;
            }
        }
        helpTooltip.setContent(helpMsg);
        helpTooltip.setPosition(evt.coordinate);
        $(helpTooltip.getHtmlElement()).removeClass('hidden');
    };

    //鼠标移出地图时，隐藏tooltip
    var mouseMoveHandler = function () {
        $(helpTooltip.getHtmlElement()).addClass('hidden');
    };

    var onDrawStart = function (evt) {
        // set sketch
        sketch = evt.feature;
        /** @type {ol.Coordinate|undefined} */
        var tooltipCoord = evt.coordinate;
        sketchChangelistener = sketch.getGeometry().on('change', function (evt) {
            var geom = evt.target;
            var output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(/** @type {ol.geom.Polygon} */(geom));
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength( /** @type {ol.geom.LineString} */(geom));
                tooltipCoord = geom.getLastCoordinate();
            }
            //measureTooltipElement.innerHTML = output;
            measureTooltip.setContent(output);
            measureTooltip.setPosition(tooltipCoord);
        });
    };

    var onDrawEnd = function (evt) {
        measureTooltip.getHtmlElement().className = 'tooltip tooltip-static';
        measureTooltip.setOffset([0, -7]);
        // unset sketch
        sketch = null;
        createMeasureTooltip();
        ol.Observable.unByKey(sketchChangelistener);
    };

    /**
* Creates a new help tooltip
*/
    function createHelpTooltip() {
        var dom = "<div class=\"tooltip hidden\"></div>";
        var helpTooltipElement = $(dom).appendTo($("body"))[0];
        helpTooltip = new TyMapUtils.Overlayex({
            offset: [15, 0],
            container: helpTooltipElement,
            positioning: 'center-left'
        });
        _overlayexs.addOverlayex(helpTooltip);
    };

    /**
         * Creates a new measure tooltip
         */
    function createMeasureTooltip() {
        var dom = "<div class=\"tooltip tooltip-measure\"></div>";
        var measureTooltipElement = $(dom).appendTo($("body"))[0];
        measureTooltip = new TyMapUtils.Overlayex({
            offset: [0, -15],
            container: measureTooltipElement,
            positioning: 'bottom-center'
        });
        _overlayexs.addOverlayex(measureTooltip);
    };

    /**
    * format length output
    * @param {ol.geom.LineString} line
    * @return {string}
    */
    var formatLength = function (line) {
        var length;
        //if (geodesicCheckbox.checked) {
        //    var coordinates = line.getCoordinates();
        //    length = 0;
        //    var sourceProj = map.getView().getProjection();
        //    for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        //        var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
        //        var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
        //        length += wgs84Sphere.haversineDistance(c1, c2);
        //    }
        //} else
        {
            length = Math.round(line.getLength() * 100) / 100;
        }
        var output;
        if (length > 1000) {
            output = (Math.round(length / 1000 * 100) / 100) +
                ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) +
                ' ' + 'm';
        }
        return output;
    };

    /**
 * format length output
 * @param {ol.geom.Polygon} polygon
 * @return {string}
 */
    var formatArea = function (polygon) {
        var area;
        //if (geodesicCheckbox.checked) {
        //    var sourceProj = map.getView().getProjection();
        //    var geom = /** @type {ol.geom.Polygon} */(polygon.clone().transform(
        //        sourceProj, 'EPSG:4326'));
        //    var coordinates = geom.getLinearRing(0).getCoordinates();
        //    area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
        //} else
        {
            area = polygon.getArea();
        }
        var output;
        if (area > 100000) {
            output = (Math.round(area / 1000000 * 100) / 100) +
                ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) +
                ' ' + 'm<sup>2</sup>';
        }
        return output;
    };

    var start = function (typeValue/*area,length*/) {
        var type = (typeValue == 'area' ? 'Polygon' : 'LineString');
        if (_draw) {
            _map.removeInteraction(_draw);
        }
        createMeasureTooltip();
        createHelpTooltip();
        _map.on('pointermove', pointerMoveHandler);
        $(_map.getViewport()).on('mouseout', mouseMoveHandler);

        _draw = new ol.interaction.Draw({
            source: _vecSource,
            type: /** @type {ol.geom.GeometryType} */ (type),
            //绘制时的样式；
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
            })
        });
        _map.addInteraction(_draw);

        _draw.on('drawstart', onDrawStart);
        _draw.on('drawend', onDrawEnd);
    };

    var close = function () {
        _map.un('pointermove', pointerMoveHandler);
        $(_map.getViewport()).off('mouseout', mouseMoveHandler);

        _vecSource.clear();
        _map.removeLayer(_vecLayer);
        _overlayexs.clear();
        if (_draw) {
            _draw.un('drawstart', onDrawStart);
            _draw.un('drawend', onDrawEnd);
            _map.removeInteraction(_draw);
        }
    };

    return {
        start: start,
        close: close,
    };
};

//自定义Overlay基类，组合模式包装ol.overlay
//goog.provide('TyMapUtils.Overlayex');
TyMapUtils.Overlayex = function (options) {
    this.id = options.id;
    this.offset = options.offset;
    this.position = options.position;
    this.container = options.container;
    this.positioning = options.positioning ? options.positioning : 'top-left';
}
TyMapUtils.Overlayex.prototype = {
    getHtmlElement: function () {
        return this.container;
    },
    createHtmlElement: function () {
        return this.container;
    },
    getOverlay: function () {
        return this.overlay;
    },
    getId: function () {
        return this.id;
    },
    createOverlay: function () {
        var this_ = this;
        this_.overlay = new ol.Overlay({
            id: this.id,
            position: this_.position,
            element: this_.createHtmlElement(),
            stopEvent: false,
            offset: this_.offset,
            positioning: this_.positioning
        });
        return this_.overlay;
    },
    setPosition: function (pos) {
        this.position = pos;
        if (this.overlay) {
            this.overlay.setPosition(pos);
        }
    },
    setOffset: function (offset) {
        this.offset = offset;
        if (this.overlay) {
            this.overlay.setOffset(offset);
        }
    },
    addEventListener: function (event, handler) {
        var this_ = this;
        if (this_.overlay) {
            var dom = this.overlay.getElement();
            dom.addEventListener(event, function (e) {
                handler(this_, e);
            });
        }
    },
    setFlag: function (obj) {
        this.flag = obj;
    },
    setContent: function (content) {
        $(this.container).empty();
        this.content = content;
        $(this.container).html(content);
    },
    openPopup : function (olMap,popup) {
        if (this.overlay) {
            popup.openPopup(olMap, this.position, popup.content);
        }
    },
    hide : function () {
        this.container.style.display = 'none';
    },
    show : function () {
        this.container.style.display = 'block';
    },
    dispose: function () {
        if (this.overlay) {
            this.overlay.getMap().removeOverlay(this.overlay);
        }
        this.overlay = null;
        $( this.container).remove();
    },
};

//自定义Icon类
//goog.provide('TyMapUtils.Icon');
//goog.require('TyMapUtils.Overlayex');
TyMapUtils.Icon = function (url, size, iconOptions) {
    this.imageUrl = url;
    this.size = size;
    this.id = "icon_" + iconOptions.id;
    this.offset = iconOptions.offset;
    this.position = iconOptions.position;
    this.container = iconOptions.container;
    this.positioning = iconOptions.positioning ? iconOptions.positioning : 'top-left';
}
ol.inherits(TyMapUtils.Icon, TyMapUtils.Overlayex);

TyMapUtils.Icon.prototype.createHtmlElement = function () {
    //<div class="Ol_Icon" style="position: absolute; margin: 0px; padding: 0px; width: 46px; height: 46px; overflow: hidden;">
    //<img style="display: block; border:none;margin-left:0px; margin-top:0px; " src="images/p2-1.png">
    //</div>
    if (!this.container) {
        var html = this.getInnerHtml();
        function createDom(html) {
            var dom = $(html).appendTo($("body"));
            return dom[0];
        }
        this.container = createDom(html);
    }
    return this.container;
}
TyMapUtils.Icon.prototype.getInnerHtml = function () {
    //<div class="Ol_Icon" style="position: absolute; margin: 0px; padding: 0px; width: 46px; height: 46px; overflow: hidden;">
    //<img style="display: block; border:none;margin-left:0px; margin-top:0px; " src="images/p2-1.png">
    //</div>
    if (!this.container) {
        var html = "<div class=\"Ol_Icon\" style=\"position: absolute; margin: 0px; padding: 0px; width: " + this.size[0] + "px; height: " + this.size[1] + "px; overflow: hidden;\">" +
            "<img style=\"display: block; border:none;margin-left:0px; margin-top:0px; left: " + this.offset[0] + "px; top: " + this.offset[0] + "px; \" src=\"" + this.imageUrl + "\">" +
        "</div>"
        return html;
    }
    else {
        return this.container.innerHtml;
    }
}
TyMapUtils.Icon.prototype.setImage = function (url) {
    this.imageUrl = url;
    $(this.container).children("img").attr('src', url);
}


//自定义Label类
//goog.provide('TyMapUtils.Label');
//goog.require('TyMapUtils.Overlayex');
TyMapUtils.Label = function (content, labelOptions) {
    this.id = "label_"+labelOptions.id;
    this.content = content;//可以是html
    this.offset = labelOptions.offset;
    this.position = labelOptions.position;
    this.style = labelOptions.style;/*backgroundColor,fontSize,fontName ,color, */
    this.container = labelOptions.container;
    this.positioning = labelOptions.positioning ? labelOptions.positioning : 'top-left';
}
ol.inherits(TyMapUtils.Label, TyMapUtils.Overlayex);

TyMapUtils.Label.prototype.createHtmlElement = function () {
    if (!this.container) {
        var html = this.getInnerHtml();
        function createDom(html) {
            var dom = $(html).appendTo($("body"));
            return dom[0];
        }
        this.container = createDom(html);
    }
    return this.container;
}
TyMapUtils.Label.prototype.getInnerHtml = function () {
    if (!this.container) {
        var html = "<label class=\"Ol_Label\"  style=\"position: absolute; -moz-user-select: none; display: inline; cursor: inherit; background-color: " + this.style.backgroundColor + "; border: 1px solid rgb(0, 0, 0); padding: 1px; white-space: nowrap; font:" + this.style.fontSize + "  " + this.style.fontName + ",simsun,sans-serif; z-index: 80; color: " + this.style.color + "; left: " + this.offset[0] + "px; top: " + this.offset[1] + "px;\">" + this.content + "</label>"
        return html;
    }
    else {
        return this.container.innerHtml;
    }
}

/*
//自定义marker类
//openlayers中的overlay是以dom为基础展现；
markerOptions:
position/* ol.Coordinate
offset 	Array.<number> 	标注的位置偏移值。
icon 	Icon 	标注所用的图标对象。
label Label 标注所用的标签对象
enableMassClear 	Boolean 	是否在调用map.clearOverlays清除此覆盖物，默认为true。
title 	String 	鼠标移到marker上的显示内容。 
*/
TyMapUtils.Marker = function (markerOptions) {
    this.id = markerOptions.id;
    this.position = markerOptions.position;
    this.offset = markerOptions.offset;
    this.icon = markerOptions.icon;
    this.label = markerOptions.label;
    this.enableMassClear = markerOptions.enableMassClear ? markerOptions.enableMassClear : false;
    this.title = markerOptions.title;
    this.container = markerOptions.container;
    this.positioning = markerOptions.positioning ? markerOptions.positioning : 'top-left';
}
ol.inherits(TyMapUtils.Marker, TyMapUtils.Overlayex);

TyMapUtils.Marker.prototype.createHtmlElement = function () {
    var this_ = this;
    if (!this.container) {
        var html = "<span class=\"Ol_Marker\" style=\"position: absolute; padding: 0px; margin: 0px; border: 0px none; width: 0px; height: 0px; -moz-user-select: none;\"></span>"

        function createDom(html) {
            var marker = $(html).appendTo($("body"));
            if (this_.icon) {
                var icon = $(this_.icon.getInnerHtml());
                icon.appendTo(marker);
                this_.icon.container = icon[0];
            }
            if (this_.label) {
                var label = $(this_.label.getInnerHtml());
                label.appendTo(marker);
                this_.label.container = label[0];
            }
            return marker[0];
        }
        this_.container = createDom(html);
    }
    return this.container;
}
TyMapUtils.Marker.prototype.openPopup = function (tyMap,popup) {
    if (this.overlay) {
        popup.openPopup(tyMap, this.position, popup.content);
    }
}

//popup Popup
//goog.provide('TyMapUtils.Popup');
//goog.require('TyMapUtils.Overlayex');
TyMapUtils.Popup = function (content, inforWindowOptions) {
    this.content = content;
    if (inforWindowOptions) {
        this.container = inforWindowOptions.container;
        this.closedHandler = inforWindowOptions.closedHandler;
        this.zIndex = inforWindowOptions.zIndex ? inforWindowOptions.zIndex : 1000;
        this.width = inforWindowOptions.width;
        this.height = inforWindowOptions.height;
        this.positioning = inforWindowOptions.positioning ? inforWindowOptions.positioning : 'top-left';
    }
}
ol.inherits(TyMapUtils.Popup, TyMapUtils.Overlayex);

TyMapUtils.Popup.prototype.createOverlay = function (_opt) {
    var this_ = this;
    var opt = {
        position: this_.position,
        element: this_.createHtmlElement(),//document.getElementById('marker'),
        stopEvent: false,
        offset: this_.offset,
        autoPan: true,//the map is panned when calling setPosition, so that the overlay is entirely visible in the current viewport. The default is false.
        autoPanAnimation: {
            duration: 500//持续时间
        },
        positioning: this_.positioning
    }
    if (_opt && $.isPlainObject(_opt)) {
        $.extend(true, opt, _opt);
    }
    else {
        $.extend(true, opt, this);
    }
    this_.overlay = new ol.Overlay(opt);
    return this_.overlay;
}
TyMapUtils.Popup.prototype.createHtmlElement = function () {
    var this_ = this;
    if (!this_.container) {
        if ($('#popup').length > 0) {
            //判断popup元素是否存在；
            this.container = $('#popup')[0];
        }
        else {
            var html = "<div id=\"popup\" class=\"ol-popup\">" +
          "<a href=\"#\" id=\"popup-closer\" class=\"ol-popup-closer\"></a>" +
          "<div id=\"popup-content\"></div>" +
        "</div>";
            function createDom(html) {
                var dom = $(html).appendTo("body");
                return dom[0];
            }
            this.container = createDom(html);

            $('#popup').css("z-index", this_.zIndex);
            $('#popup').css("width", this_.width + "px");
            $('#popup').css("height", this_.height + "px");
            $('#popup-closer').mousedown(function (evt) {   //为了防止map.click事件触发，这里用mousedown事件；             
                $('#popup-closer').blur();
                //evt.preventDefault();//这个阻止不了map.click
                //evt.stopPropagation();//这个不行；
                //console.log('popup closer clicked');               
                this_.hide();
                return false;//这个不行；
                //要用mousedown事件才行；
            });
        }
    }
    //$('#popup').show();
    //$('#popup-content').html(this.content);
    return this.container;
}
TyMapUtils.Popup.prototype.setContent = function (content) {
    $('#popup-content').empty();
    this.content = content;
    $('#popup-content').html(this.content);
}
TyMapUtils.Popup.prototype.openPopup = function (olMap, coord, content) {  
    if (!this.overlay) {
        olMap.addOverlay(this.createOverlay());
    }
    this.show();
    this.setContent(content);
    this.setPosition(coord);
}


//自定义的比例尺  视图中的1cm表示地图上多少单位
//goog.provide('TyMapUtils.ScaleLine ');
TyMapUtils.ScaleLine = function (opt_options) {
    var options = opt_options ? opt_options : {};
    var className = options.className ? options.className : 'ol-scale-line';
    /**
     * @private
     * @type {Element}
     */
    this.innerElement_ = document.createElement('DIV');
    this.innerElement_.className = className + '-inner';
    /**
     * @private
     * @type {Element}
     */
    this.element_ = document.createElement('DIV');
    //this.element_.className = className + ' ' + ol.css.CLASS_UNSELECTABLE;
    this.element_.appendChild(this.innerElement_);
    /**
     * @private
     * @type {?olx.ViewState}
     */
    this.viewState_ = null;
    /**
     * @private
     * @type {number}
     */
    this.minWidth_ = options.minWidth !== undefined ? options.minWidth : 64;
    /**
     * @private
     * @type {boolean}
     */
    this.renderedVisible_ = false;
    /**
     * @private
     * @type {number|undefined}
     */
    this.renderedWidth_ = undefined;
    /**
     * @private
     * @type {string}
     */
    this.renderedHTML_ = '';
    var render = options.render ? options.render : ol.control.ScaleLine.render;

    ol.control.Control.call(this, {
        element: this.element_,
        render: render,
        target: options.target
    });

    ol.events.listen(
        this, ol.Object.getChangeEventType(ol.control.ScaleLine.Property.UNITS),
        this.handleUnitsChanged_, false, this);

    this.setUnits(/** @type {ol.control.ScaleLineUnits} */(options.units) ||
        ol.control.ScaleLine.Units.METRIC);
};
ol.inherits(TyMapUtils.ScaleLine, ol.control.Control);

/**
 * Return the units to use in the scale line.
 * @return {ol.control.ScaleLineUnits|undefined} The units to use in the scale
 *     line.
 * @observable
 * @api stable
 */
TyMapUtils.ScaleLine.prototype.getUnits = function () {
    return /** @type {ol.control.ScaleLineUnits|undefined} */ (
        this.get(ol.control.ScaleLine.Property.UNITS));
};

/**
 * Update the scale line element.
 * @param {ol.MapEvent} mapEvent Map event.
 * @this {ol.control.ScaleLine}
 * @api
 */
TyMapUtils.ScaleLine.render = function (mapEvent) {
    var frameState = mapEvent.frameState;
    if (!frameState) {
        this.viewState_ = null;
    } else {
        this.viewState_ = frameState.viewState;
    }
    this.updateElement_();
};

/**
 * @private
 */
TyMapUtils.ScaleLine.prototype.handleUnitsChanged_ = function () {
    this.updateElement_();
};


/**
 * Set the units to use in the scale line.
 * @param {ol.control.ScaleLineUnits} units The units to use in the scale line.
 * @observable
 * @api stable
 */
TyMapUtils.ScaleLine.prototype.setUnits = function (units) {
    this.set(ol.control.ScaleLine.Property.UNITS, units);
};

/**
 * 自定义的比例尺。仅支持平面坐标系
 */
TyMapUtils.ScaleLine.prototype.updateElement_ = function () {
    var viewState = this.viewState_;

    if (!viewState) {
        if (this.renderedVisible_) {
            this.element_.style.display = 'none';
            this.renderedVisible_ = false;
        }
        return;
    }

    var center = viewState.center;
    var pointResolution = viewState.resolution;
    //地图1cm表示地图多少米
    var nominalCount = pointResolution * 96 * 39.3701 / 100; //scale = resolution * 96 * 39.3701（1米=39.3701英寸，1英寸=96像素(DPI=96)）
    var suffix = '';
    if (nominalCount < 1000) {
        nominalCount = Math.round(nominalCount);
        suffix = '米';
    } else if (nominalCount > 1000) {
        suffix = '公里';
        nominalCount = (nominalCount / 1000).toFixed(1);
    }
    var html = nominalCount + ' ' + suffix;
    if (this.renderedHTML_ != html) {
        this.innerElement_.innerHTML = html;
        this.renderedHTML_ = html;
    }

    var width = this.minWidth_;
    if (this.renderedWidth_ != width) {
        this.innerElement_.style.width = width + 'px';
        this.renderedWidth_ = width;
    }

    if (!this.renderedVisible_) {
        this.element_.style.display = '';
        this.renderedVisible_ = true;
    }
};


//自定义事件参数；
TyMapUtils.SelectEvent = function (type, feature,mapBrowserEvent) {
    ol.events.Event.call(this, type);
    this.feature = feature;
    this.mapBrowserEvent = mapBrowserEvent;
};
ol.inherits(TyMapUtils.SelectEvent, ol.events.Event);

/**
       * @constructor
       * @extends {ol.interaction.Pointer}
       @options
            options.layers : array<layer>
            style : ol.style
            specifiedFeature : ol.feature();
       移动Feature
       触发事件: moveend
       */
TyMapUtils.PointerMove = function (options) {
    ol.interaction.Pointer.call(this, {
        handleDownEvent: TyMapUtils.PointerMove.prototype.handleDownEvent,
        handleDragEvent: TyMapUtils.PointerMove.prototype.handleDragEvent,
        handleMoveEvent: TyMapUtils.PointerMove.prototype.handleMoveEvent,
        handleUpEvent: TyMapUtils.PointerMove.prototype.handleUpEvent
    });

    this.features_ = options.features || new ol.Collection();
    this.layers_ = options.layers;
    this.style_ = options.style;
    /**
     * @type {ol.Pixel}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';
    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature_ = null;
    this.moved_ = false;
    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;
};
ol.inherits(TyMapUtils.PointerMove, ol.interaction.Pointer);

//TyMapUtils.PointerMove.prototype.setspecifiedFeature = function (feature) {
//    this.specifiedFeature_ = feature;
//};

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
TyMapUtils.PointerMove.prototype.handleDownEvent = function (evt) {
    var map = evt.map;
    var selfeature
     map.forEachFeatureAtPixel(evt.pixel,
        function (feature, layer) {
            if (ol.array.includes(this.layers_, layer)) {
                //如果指定了features，那只能移动这个指定的features，否则不允许移动；
                if (this.features_.getLength() > 0) {
                    this.features_.forEach(function (item) {
                        if (item === feature) {
                            selfeature = item;
                            return !!selfeature;
                        }
                    });
                }
            }
            return !!selfeature;
        },this);
    if (selfeature) {
        this.coordinate_ = evt.coordinate;        
    }
    this.feature_ = selfeature;
    return !!selfeature;
};
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
TyMapUtils.PointerMove.prototype.handleDragEvent = function (evt) {
    if (this.feature_) {
        var deltaX = evt.coordinate[0] - this.coordinate_[0];
        var deltaY = evt.coordinate[1] - this.coordinate_[1];

        if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
            this.moved_ = true;
            var geometry = /** @type {ol.geom.SimpleGeometry} */
                (this.feature_.getGeometry());
            geometry.translate(deltaX, deltaY);
        }
        this.coordinate_[0] = evt.coordinate[0];
        this.coordinate_[1] = evt.coordinate[1];
    }
};
/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
TyMapUtils.PointerMove.prototype.handleMoveEvent = function (evt) {
    if (this.cursor_) {
        var map = evt.map;
        //var feature = map.forEachFeatureAtPixel(evt.pixel,
        //    function (feature) {
        //        return feature;
        //    });
        var element =map.getTargetElement();
        if (this.feature_) {
            if (element.style.cursor != this.cursor_) {
                this.previousCursor_ = element.style.cursor;
                element.style.cursor = this.cursor_;
            }
        } else if (this.previousCursor_ !== undefined) {
            element.style.cursor = this.previousCursor_;
            this.previousCursor_ = undefined;
        }
    }
};
/**
 * @return {boolean} `false` to stop the drag sequence.
 */
TyMapUtils.PointerMove.prototype.handleUpEvent = function (mapBrowserEvent) {
    if (this.moved_) {
        this.dispatchEvent(
                new TyMapUtils.SelectEvent('moveend', this.feature_, mapBrowserEvent)
              );
    }
    this.coordinate_ = null;
    this.feature_ = null;
    this.moved_ = false;
    return false;
};


/**
       * @constructor
       * @extends {ol.interaction.Interaction}
       @options
            options.layers : array<layer>
               condition: ol.events.condition.click,
               style: ol.style.Style 选中后的样式
       只允许选一个feature，并且不能移除；
       触发事件: select
       */
TyMapUtils.SingleSelect = function (options) {
    ol.interaction.Interaction.call(this, {
        handleEvent: TyMapUtils.SingleSelect.handleEvent
    });

    this.layers_ = options.layers;
    this.condition_ = options.condition ?
      options.condition : ol.events.condition.singleClick;
    this.feature_ = null;
    this.featureClone_ = null;
    //只允许设置一个初始选择对象；
    this.features_ = options.features;
    var featuresClone = new ol.Collection();
    if (this.features_ && this.features_.getLength() > 0) {
        this.feature_ = features.item(0);
        this.featureClone_ = this.feature_.clone();
        this.features_.clear();
        this.features_.push(this.feature_);

        var geom = this.feature_.getGeometry();//使之共用一个geometry，这样当编辑修改feature时能联动；
        this.featureClone_.setGeometry(geom);
        featuresClone.push(this.featureClone_);
    }
    this.featureOverlay_ = new ol.layer.Vector({
        source: new ol.source.Vector({
            useSpatialIndex: false,
            wrapX: false,
            features: featuresClone//显示的数据是clone的feature，目的是为了当feature#setStyle后仍然有selected样式
        }),
        style: options.style,
    });
    //是否有选中后的效果样式；有时候可能只是想要一个select事件而不需要select的样式，所以当没有设置options.style时就不显示；
    var useSelectStyle = (options.style === undefined ? false : true);
    this.featureOverlay_.setVisible(useSelectStyle);
};
ol.inherits(TyMapUtils.SingleSelect, ol.interaction.Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
TyMapUtils.SingleSelect.prototype.setMap = function (map) {

    var currentMap = this.getMap();
    var selectedFeature =
      this.featureOverlay_.getSource().getFeaturesCollection().item(0);//只要1个；
    if (currentMap && selectedFeature) {
        currentMap.unskipFeature(selectedFeature);
    }
    ol.interaction.Interaction.prototype.setMap.call(this, map);
    this.featureOverlay_.setMap(map);
    if (map && selectedFeature) {
        map.skipFeature(selectedFeature);
    }
};

TyMapUtils.SingleSelect.handleEvent = function (mapBrowserEvent) {
    if (!this.condition_(mapBrowserEvent)) {
        return true;
    }
    var map = mapBrowserEvent.map;
    var featuresClone = this.featureOverlay_.getSource().getFeaturesCollection();
    var selectedFeature;
     map.forEachFeatureAtPixel(mapBrowserEvent.pixel,
        function (feature, layer) {
            if (ol.array.includes(this.layers_, layer)) {
                selectedFeature = feature;
                return !!feature;
            }
            return false;
        }, this);
     if (selectedFeature) {
         this.feature_ = selectedFeature;
         featuresClone.clear();
         this.featureClone_ = this.feature_.clone();
         this.featureClone_.setStyle(undefined);//清除自定义的样式

         var geom = this.feature_.getGeometry();//使之共用一个geometry，这样当编辑修改feature时能联动；
         this.featureClone_.setGeometry(geom);
         featuresClone.push(this.featureClone_);

         if (this.features_) {
             this.features_.clear();
             this.features_.push(this.feature_);
         }
    }
    else {
        this.feature_ = undefined;
    }
    //不管是否选中，都触发事件；
    this.dispatchEvent(
           new TyMapUtils.SelectEvent('select', this.feature_, mapBrowserEvent)
         );
    return !!selectedFeature;
};


/*
自定义的Source，适用于以下场景：
1、有一个数据源，但是需要根据某些条件来判断是否要显示出来；
2、后端将多个图层合并到一起返回给前端，前端要将其分开来显示；
*/
TyMapUtils.GroupVectorSource = function (options) {
    ol.source.Vector.call(this, {
        attributions: options.attributions,
        extent: options.extent,
        logo: options.logo,
        projection: options.projection,
        wrapX: options.wrapX
    });

    /**
     * @type {number|undefined}
     * @private
     */
    this.resolution_ = undefined;
    /**
     * @type {Array.<ol.Feature>}
     * @private
     */
    this.features_ = [];

    //过滤feature
    this.featuresFilterFunc_ = options.featuresFilterFunc_;

    /**
     * @type {ol.source.Vector}
     * @private
     */
    this.source_ = options.source;

    this.source_.on(ol.events.EventType.CHANGE,
        TyMapUtils.GroupVectorSource.prototype.onSourceChange_, this);
};
ol.inherits(TyMapUtils.GroupVectorSource, ol.source.Vector);


/**
 * Get a reference to the wrapped source.
 * @return {ol.source.Vector} Source.
 * @api
 */
TyMapUtils.GroupVectorSource.prototype.getSource = function () {
    return this.source_;
};


/**
 * @inheritDoc
 */
TyMapUtils.GroupVectorSource.prototype.loadFeatures = function (
    extent, resolution, projection) {
    this.source_.loadFeatures(extent, resolution, projection);
    if (resolution !== this.resolution_) {
        this.clear();
        this.resolution_ = resolution;
         this.featuresFilter_();
        this.addFeatures(this.features_);
    }
};
/**
 * @private
 */
TyMapUtils.GroupVectorSource.prototype.featuresFilter_ = function () {
    if (this.resolution_ === undefined) {
        return;
    }
    this.features_.length = 0;    
    this.features_ = this.featuresFilterFunc_(this.source_.getFeatures(), this.resolution_);
};

/**
 * handle the source changing
 * @private
 */
TyMapUtils.GroupVectorSource.prototype.onSourceChange_ = function () {
    this.clear();
   this.featuresFilter_();
   this.addFeatures(this.features_);
   this.changed();
};





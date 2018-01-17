/**
 * Mostly a big copy/paste from https://raw.githubusercontent.com/openlayers/ol3/master/src/ol/control/overviewmapcontrol.js
 * without rotation and zoom/dezoom plus some adapations from http://ol3.qtibia.ro/build/examples/overviewmap-custom-drag.html
 * to add the possibility to drag the box on the minimap to move the main map
 */
goog.provide('ol.control.CustomOverviewMap');
goog.require('ol.control.Control');
ol.control.CustomOverviewMap = function (opt_options) {
    var options = typeof opt_options !== 'undefined' ? opt_options : {};
    this.collapsed_ = typeof options.collapsed !== 'undefined' ? options.collapsed : true;
    this.onCollapseOrExpand = options.onCollapseOrExpand || function () { };
    this.needFirstRenderUpdate_ = this.collapsed_; //prepare the hack to render the map when uncollapsed the first time

    var tipLabel = typeof options.tipLabel !== 'undefined' ? options.tipLabel : 'Overview map';
    this.collapseLabel_ = $('<span>\u00BB</span>').get(0);
    this.label_ = $('<span>\u00AB</span>').get(0);
    var activeLabel = (!this.collapsed_) ? this.collapseLabel_ : this.label_;
    var button = $('<button type="button" title="{0}"></button>'.replace('{0}', tipLabel)).append(activeLabel);
    button.on('click', this.handleClick_.bind(this));
    //ol.control.Control.bindMouseOutFocusOutBlur(button);
    button.on('mouseout', function () { this.blur(); });
    button.on('focusout', function () { this.blur(); });

    var ovmapDiv = $('<div class="ol-overviewmap-map"></div>').get(0);
    this.ovmap_ = new ol.Map({
        controls: new ol.Collection(),
        interactions: new ol.Collection(),
        layers: options.Layers,
        target: ovmapDiv,
        view: opt_options.view,//new ol.View(opt_options.view)
    });

    var box = $('<div class="ol-overviewmap-box"></div>');
    this.boxOverlay_ = new ol.Overlay({
        position: [0, 0],
        positioning: 'bottom-left',
        element: box.get(0)
    });
    this.ovmap_.addOverlay(this.boxOverlay_);

    var cssClasses = 'ol-overviewmap ol-unselectable ol-control' +
        (this.collapsed_ ? ' ol-collapsed' : '');
    var element = $('<div class="{0}"></div>'.replace('{0}', cssClasses)).append(ovmapDiv).append(button).get(0);

    ol.control.Control.call(this, {
        element: element,
        render: ol.control.CustomOverviewMap.render
    });

    // deal with dragable minimap
    this.dragging = null;
    box.on("mousedown", this.onStartDrag.bind(this));
    $(document.body).on("mousemove", this.onDrag.bind(this));
    $(document.body).on("mouseup", this.onEndDrag.bind(this));
};
ol.inherits(ol.control.CustomOverviewMap, ol.control.Control);

ol.control.CustomOverviewMap.prototype.onStartDrag = function (e) {
    // remember some data to use during onDrag or onDragEnd
    var box = $(e.target);
    this.dragging = {
        el: box,
        evPos: { top: e.pageY, left: e.pageX },
        elPos: box.offset()
    };
}

ol.control.CustomOverviewMap.prototype.onDrag = function (e) {
    if (this.dragging) {
        //set the position of the box to be oldPos+translation(ev)
        var curOffset = this.dragging.el.offset();
        var newOffset = {
            top: curOffset.top + (e.pageY - this.dragging.evPos.top),
            left: curOffset.left + (e.pageX - this.dragging.evPos.left)
        };
        this.dragging.evPos = { top: e.pageY, left: e.pageX };
        this.dragging.el.offset(newOffset);
    }
}

ol.control.CustomOverviewMap.prototype.onEndDrag = function (e) {
    if (this.dragging) {
        //see ol3.qtibia.ro href at the top of the class to understand this
        var map = this.getMap();
        var offset = this.dragging.el.position();
        var divSize = [this.dragging.el.width(), this.dragging.el.height()];
        var mapSize = map.getSize();
        var c = map.getView().getResolution();
        var xMove = offset.left * (Math.abs(mapSize[0] / divSize[0]));
        var yMove = offset.top * (Math.abs(mapSize[1] / divSize[1]));
        var bottomLeft = [0 + xMove, mapSize[1] + yMove];
        var topRight = [mapSize[0] + xMove, 0 + yMove];
        var left = map.getCoordinateFromPixel(bottomLeft);
        var top = map.getCoordinateFromPixel(topRight);
        var extent = [left[0], left[1], top[0], top[1]];
        map.getView().fitExtent(extent, map.getSize());
        map.getView().setResolution(c);
        //reset the element at the original position so that when the main map will trigger
        //the moveend event, this event will be replayed on the box of the minimap
        this.dragging.el.offset(this.dragging.elPos);
        this.dragging = null;
    }
}

ol.control.CustomOverviewMap.render = function (mapEvent) {
    //see original OverviewMap href at the top of the class to understand this
    var map = this.getMap();
    var ovmap = this.ovmap_;
    var mapSize = map.getSize();
    var view = map.getView();
    var ovview = ovmap.getView();
    var overlay = this.boxOverlay_;
    var box = this.boxOverlay_.getElement();
    var extent = view.calculateExtent(mapSize);
    var ovresolution = ovview.getResolution();
    var bottomLeft = ol.extent.getBottomLeft(extent);
    var topRight = ol.extent.getTopRight(extent);
    overlay.setPosition(bottomLeft);
    // set box size calculated from map extent size and overview map resolution
    if (box) {
        var boxWidth = Math.abs((bottomLeft[0] - topRight[0]) / ovresolution);
        var boxHeight = Math.abs((topRight[1] - bottomLeft[1]) / ovresolution);
        $(box).width(boxWidth).height(boxHeight);
    }
};


ol.control.CustomOverviewMap.prototype.handleClick_ = function (event) {
    event.preventDefault();

    this.collapsed_ = !this.collapsed_;
    $(this.element).toggleClass('ol-collapsed');
    // change label
    if (this.collapsed_) {
        this.collapseLabel_.parentNode.replaceChild(this.label_, this.collapseLabel_);
    } else {
        this.label_.parentNode.replaceChild(this.collapseLabel_, this.label_);
    }

    // manage overview map if it had not been rendered before and control is expanded    
    if (!this.collapsed_ && this.needFirstRenderUpdate_) {
        this.needFirstRenderUpdate_ = false;
        this.ovmap_.updateSize();
        this.ovmap_.once("postrender", function () {
            this.render();
        }.bind(this));
    }

    //trigger event
    this.onCollapseOrExpand(this.collapsed_);
};

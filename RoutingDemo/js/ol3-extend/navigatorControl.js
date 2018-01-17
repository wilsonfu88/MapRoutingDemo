function navigatorControl(opt_options) {
    var options = opt_options || {};
    var self = this;
    //event handler
    $(".nav_zoom_in").die().on("click", function (e) {
        self.zoomIn();
    });
    $(".nav_zoom_out").die().on("click", function (e) {
        self.zoomOut();
    });
    $(".nav_control_left").die().on("click", function (e) {
        self.toLeft();
    });
    $(".nav_control_right").die().on("click", function (e) {
        self.toRight();
    });
    $(".nav_control_up").die().on("click", function (e) {
        self.toUp();
    });
    $(".nav_control_down").die().on("click", function (e) {
        self.toDown();
    });

    //div
    this.zooms_ = options.zooms;
    this.navZoomSpider_ = options.navZoomSpider === undefined ? $('#navZoomSpider')[0] : ptions.navZoomSpider;
    this.navZoomBtn_ = options.navZoomBtn === undefined ? $('#navZoomBtn')[0] : ptions.navZoomBtn;
    this.navCurrZoom_ = options.navCurrZoom === undefined ? $('#navCurrZoom')[0] : ptions.navCurrZoom;
    /**
   * @type {boolean}
   * @private
   */
    this.dragging_;

    /**
     * @type {!Array.<ol.events.Key>}
     * @private
     */
    this.dragListenerKeys_ = [];

    /**
     * @type {number}
     * @private
     */
    this.heightLimit_ = 10;

    /**
     * @type {number|undefined}
     * @private
     */
    this.previousX_;

    /**
     * @type {number|undefined}
     * @private
     */
    this.previousY_;

    /**
     * The calculated thumb size (border box plus margins).  Set when initSlider_
     * is called.
     * @type {ol.Size}
     * @private
     */
    this.thumbSize_ = null;

    /**
     * Whether the slider is initialized.
     * @type {boolean}
     * @private
     */
    this.sliderInitialized_ = false;

    /**
     * @type {number}
     * @private
     */
    this.duration_ = options.duration !== undefined ? options.duration : 200;
    /**
  * @type {ol.pointer.PointerEventHandler}
  * @private
  */
    this.dragger_ = new ol.pointer.PointerEventHandler(this.navZoomSpider_);
    //drag event
    ol.events.listen(this.dragger_, ol.pointer.EventType.POINTERDOWN,
        this.handleDraggerStart_, this);
    ol.events.listen(this.dragger_, ol.pointer.EventType.POINTERMOVE,
        this.handleDraggerDrag_, this);
    ol.events.listen(this.dragger_, ol.pointer.EventType.POINTERUP,
        this.handleDraggerEnd_, this);

    //sliper click event
    ol.events.listen(this.navZoomSpider_, ol.events.EventType.CLICK,
        this.handleContainerClick_, this);
    ol.events.listen(this.navCurrZoom_, ol.events.EventType.CLICK,
       this.handleContainerClick_, this);
    ol.events.listen(this.navZoomBtn_, ol.events.EventType.CLICK,
        ol.events.Event.stopPropagation);

    var render = options.render === undefined ? navigatorControl.render : options.render;
    ol.control.Control.call(this, {
        element: options.element,
        target: options.target,
        render: render,
    });
};
ol.inherits(navigatorControl, ol.control.Control);

/**
 * @inheritDoc
 */
navigatorControl.prototype.disposeInternal = function () {
    this.dragger_.dispose();
    ol.control.Control.disposeInternal.call(this);
};

/**
 * Handle dragger start events.
 * @param {ol.pointer.PointerEvent} event The drag event.
 * @private
 */
navigatorControl.prototype.handleDraggerStart_ = function (event) {
    if (!this.dragging_ &&
        event.originalEvent.target === this.navZoomBtn_) {
        this.getMap().getView().setHint(ol.ViewHint.INTERACTING, 1);
        this.previousX_ = event.clientX;
        this.previousY_ = event.clientY;
        this.dragging_ = true;

        if (this.dragListenerKeys_.length === 0) {
            var drag = this.handleDraggerDrag_;
            var end = this.handleDraggerEnd_;
            this.dragListenerKeys_.push(
              ol.events.listen(document, ol.events.EventType.MOUSEMOVE, drag, this),
              ol.events.listen(document, ol.events.EventType.TOUCHMOVE, drag, this),
              ol.events.listen(document, ol.pointer.EventType.POINTERMOVE, drag, this),
              ol.events.listen(document, ol.events.EventType.MOUSEUP, end, this),
              ol.events.listen(document, ol.events.EventType.TOUCHEND, end, this),
              ol.events.listen(document, ol.pointer.EventType.POINTERUP, end, this)
            );
        }
    }
};

/**
 * Handle dragger drag events.
 *
 * @param {ol.pointer.PointerEvent|Event} event The drag event.
 * @private
 */
navigatorControl.prototype.handleDraggerDrag_ = function (event) {
    if (this.dragging_) {
        var element = this.navZoomBtn_;
        //通过本次的坐标与上一次的坐标，计算Y的偏移距离；然后除以 heightLimit_(一级对应的像素距离)得到应该放大或缩小多少级 ；
        var deltaX = event.clientX - this.previousX_ + parseInt(element.style.left, 10);
        var deltaY = event.clientY - this.previousY_ + parseInt(element.style.top, 10);
        var relativePosition = this.getRelativePosition_(deltaX, deltaY);
        this.currentResolution_ = this.getResolutionForPosition_(relativePosition);
        this.getMap().getView().setResolution(this.currentResolution_);
        this.setThumbPosition_(this.currentResolution_);
        this.previousX_ = event.clientX;
        this.previousY_ = event.clientY;
    }
};

/**
 * Handle dragger end events.
 * @param {ol.pointer.PointerEvent|Event} event The drag event.
 * @private
 */
navigatorControl.prototype.handleDraggerEnd_ = function (event) {
    if (this.dragging_) {
        var map = this.getMap();
        var view = map.getView();
        view.setHint(ol.ViewHint.INTERACTING, -1);
        //goog.asserts.assert(this.currentResolution_,
        //    'this.currentResolution_ should be defined');
        map.beforeRender(ol.animation.zoom({
            resolution: this.currentResolution_,
            duration: this.duration_,
            easing: ol.easing.easeOut
        }));
        var resolution = view.constrainResolution(this.currentResolution_);
        view.setResolution(resolution);
        this.dragging_ = false;
        this.previousX_ = undefined;
        this.previousY_ = undefined;
        this.dragListenerKeys_.forEach(ol.events.unlistenByKey);
        this.dragListenerKeys_.length = 0;
    }
};

/**
 * @param {Event} event The browser event to handle.
 * @private
 */
navigatorControl.prototype.handleContainerClick_ = function (event) {
    var map = this.getMap();
    var view = map.getView();
    var currentResolution = view.getResolution();
    //goog.asserts.assert(currentResolution,
    //    'currentResolution should be defined');
    map.beforeRender(ol.animation.zoom({
        resolution: currentResolution,
        duration: this.duration_,
        easing: ol.easing.easeOut
    }));
    var relativePosition = this.getRelativePosition_(
        event.offsetX,// - this.thumbSize_[0] / 2,
        event.offsetY);//- this.thumbSize_[1] / 2);
    var resolution = this.getResolutionForPosition_(relativePosition);
    view.setResolution(view.constrainResolution(resolution));
};


/**
 * Initializes the slider element. This will determine and set this controls
 * direction_ and also constrain the dragging of the thumb to always be within
 * the bounds of the container.
 *
 * @private
 */
navigatorControl.prototype.initSlider_ = function () {
    //var container = this.navZoomSpider_;
    //var navCurrZoom = this.navCurrZoom_;
    //var navCurrButton = this.navZoomBtn_;

    //var containerHeight = this.zooms_ * this.heightLimit_;
    //container.style.height = containerHeight + 'px';

    //var navCurrZoomTop = parseInt(container.style.top) + containerHeight;
    //var navCurrButtonTop = parseInt(navCurrZoomTop)- parseInt(navCurrButton.style.height);

    //navCurrZoom.style.top = navCurrZoomTop + 'px';
    //navCurrButton.style.top = navCurrButtonTop + 'px';

    //this.thumbSize_ = [navCurrButton.width, navCurrButton.height];
    this.sliderInitialized_ = true;
};

/**
 * Positions the thumb inside its container according to the given resolution.
 *
 * @param {number} res The res.
 * @private
 */
navigatorControl.prototype.setThumbPosition_ = function (res) {
    var position = this.getPositionForResolution_(res);

    //var container = this.navZoomSpider_;
    //var navCurrZoom = this.navCurrZoom_;
    //var navCurrButton = this.navZoomBtn_;

    //var navCurrZoomTop = parseInt(container.style.top) - position * this.heightLimit_;
    //var navCurrButtonTop = parseInt(navCurrZoomTop) + parseInt(navCurrButton.styel.height);

    //navCurrZoom.style.top = navCurrZoomTop + 'px';
    //navCurrButton.style.top = navCurrButtonTop + 'px';
};


/**
 * Calculates the relative position of the thumb given x and y offsets.  The
 * relative position scales from 0 to 1.  The x and y offsets are assumed to be
 * in pixel units within the dragger limits.
 *
 * @param {number} x Pixel position relative to the left of the slider.
 * @param {number} y Pixel position relative to the top of the slider.
 * @return {number} The relative position of the thumb.
 * @private
 */
navigatorControl.prototype.getRelativePosition_ = function (x, y) {
    var amount= y / this.heightLimit_;
    return ol.math.clamp(amount, 0, 1);
};


/**
 * Calculates the corresponding resolution of the thumb given its relative
 * position (where 0 is the minimum and 1 is the maximum).
 *
 * @param {number} position The relative position of the thumb.
 * @return {number} The corresponding resolution.
 * @private
 */
navigatorControl.prototype.getResolutionForPosition_ = function (position) {
    var fn = this.getMap().getView().getResolutionForValueFunction();
    return fn(1 - position);
};

/**
 * Determines the relative position of the slider for the given resolution.  A
 * relative position of 0 corresponds to the minimum view resolution.  A
 * relative position of 1 corresponds to the maximum view resolution.
 *
 * @param {number} res The resolution.
 * @return {number} The relative position value (between 0 and 1).
 * @private
 */
navigatorControl.prototype.getPositionForResolution_ = function (res) {
    var fn = this.getMap().getView().getValueForResolutionFunction();
    return 1 - fn(res);
};



/**
 * Update the zoomslider element.
 * @param {ol.MapEvent} mapEvent Map event.
 * @this {ol.control.ZoomSlider}
 * @api
 */
navigatorControl.render = function (mapEvent) {
    if (!mapEvent.frameState) {
        return;
    }
    //goog.asserts.assert(mapEvent.frameState.viewState,
    //    'viewState should be defined');
    if (!this.sliderInitialized_) {
        this.initSlider_();
    }
    var res = mapEvent.frameState.viewState.resolution;
    if (res !== this.currentResolution_) {
        this.currentResolution_ = res;
        this.setThumbPosition_(res);
    }
};

 navigatorControl.prototype.zoomIn = function () {
     var map = this.getMap();
     var view = map.getView();
     var zoom = view.getZoom();

     // 动画效果
     var animation = ol.animation.zoom({
         duration: 500,
         resolution: view.getResolution()
     });
     map.beforeRender(animation);
     view.setZoom(++zoom);
 };

 navigatorControl.prototype.zoomOut = function (e) {
     var view = this.getMap().getView();
     var zoom = view.getZoom();
     // 动画效果
     var animation = ol.animation.zoom({
         duration: 500,
         resolution: view.getResolution()
     });
     map.beforeRender(animation);
     view.setZoom(--zoom);
};
 navigatorControl.prototype.toLeft = function (e) {
     var view = this.getMap().getView();
         var resolution = view.getResolution();
         var size = this.getMap().getSize();
         var center = view.getCenter();
         center[0] = center[0] - (size[0] * resolution) / 2;
     // 动画效果
         var animation = ol.animation.pan({
             duration: 1000,
             source: view.getCenter()
         });
         map.beforeRender(animation);
         view.setCenter(center);
         //this.getMap().render();
     };
 navigatorControl.prototype.toRight = function (e) {
     var view = this.getMap().getView();
         var resolution = view.getResolution();
         var size = this.getMap().getSize();
         var center = view.getCenter();
         center[0] = center[0] + (size[0] * resolution) / 2;
     // 动画效果
         var animation = ol.animation.pan({
             duration: 1000,
             source: view.getCenter()
         });
         map.beforeRender(animation);
         view.setCenter(center);
     };
 navigatorControl.prototype.toUp = function (e) {
     var view = this.getMap().getView();
         var resolution = view.getResolution();
         var size = this.getMap().getSize();
         var center = view.getCenter();
         center[1] = center[1] - (size[1] * resolution) / 2;
     // 动画效果
         var animation = ol.animation.pan({
             duration: 1000,
             source: view.getCenter()
         });
         map.beforeRender(animation);
         view.setCenter(center);
     };
 navigatorControl.prototype.toDown = function (e) {
     var view = this.getMap().getView();
         var resolution = view.getResolution();
         var size = this.getMap().getSize();
         var center = view.getCenter();
         center[1] = center[1] + (size[1] * resolution) / 2;
     // 动画效果
         var animation = ol.animation.pan({
             duration: 1000,
             source: view.getCenter()
         });
         map.beforeRender(animation);
         view.setCenter(center);
     };
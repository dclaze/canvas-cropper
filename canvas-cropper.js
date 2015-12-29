function CanvasCropper(canvas) {
    if (!this.isSupported())
        throw "CanvasCropper not supported for this browser";
    this._canvas = canvas;
    this._context = canvas.getContext('2d');
    this._createOverlay();

    this._enabled = false;
    this._dragging = false;
    this._cropRectangle = {};
    this._shadowOverlay = {};
};

CanvasCropper.prototype.capture = function(callback) {
    return this.enable(true, callback);
};

CanvasCropper.prototype.enable = function(autoCapture, callback) {
    this.reset();
    this._autoCapture = typeof(autoCapture) !== "undefined" ? autoCapture : true;
    this._addListeners();
    this._setupCanvas();
    this._enabled = true;
    this._callback = callback;

    return this;
};

CanvasCropper.prototype.isEnabled = function() {
    return this._enabled;
}

CanvasCropper.prototype.disable = function() {
    this._removeListeners();
    this._restoreCanvas();
    this._enabled = false;

    return this;
};

CanvasCropper.prototype.reset = function() {
    this._dragging = false;
    this._cropRectangle = {};
    this._shadowOverlay = {};
    this._overlay.style.height = 0;
    this._overlay.style.width = 0;
    this._callback = undefined;

    return this;
};

CanvasCropper.prototype.getCroppedImage = function() {
    return this._getImageAsUrl();
};

CanvasCropper.prototype.isSupported = function() {
    return true;
};

CanvasCropper.prototype._createOverlay = function() {
    this._overlay = document.createElement('div');
    this._overlay.style.position = "absolute";
    this._overlay.style.backgroundColor = "red";
    this._overlay.style.opacity = 0.4;
    this._overlay.style.borderWidth = "15px";
    this._overlay.style.height = 0;
    this._overlay.style.width = 0;
    document.body.appendChild(this._overlay);
};

CanvasCropper.prototype._addListeners = function() {
    this._mouseDownListenerFn = this._onMouseDown.bind(this)
    this._canvas.addEventListener('mousedown', this._mouseDownListenerFn, false);
    this._mouseMoveListenerFn = this._onMouseMove.bind(this);
    document.addEventListener('mousemove', this._mouseMoveListenerFn, false);
    this.mouseUpListenerFn = this._onMouseUp.bind(this);
    document.addEventListener('mouseup', this.mouseUpListenerFn, false);
};

CanvasCropper.prototype._removeListeners = function() {
    this._canvas.removeEventListener('mousedown', this._mouseDownListenerFn, false);
    document.removeEventListener('mousemove', this._mouseMoveListenerFn, false);
    document.removeEventListener('mouseup', this.mouseUpListenerFn, false);
};

CanvasCropper.prototype._onMouseDown = function(e) {
    this._dragging = true;
    var point = QuirksMode.getAbsolutePoint(e),
        canvasOffset = QuirksMode.getElementOffsetPoint(this._canvas);
    this._setShadowOverlayStartPoint(point.x, point.y);
    this._setCropRectangleStartPoint(point.x - canvasOffset.x, point.y - canvasOffset.y);
};

CanvasCropper.prototype._onMouseMove = function(e) {
    if (this._dragging && this._enabled) {
        var point = QuirksMode.getAbsolutePoint(e),
            canvasOffset = QuirksMode.getElementOffsetPoint(this._canvas);
        this._updateShadowOverlayEndPoint(point.x, point.y);
        this._updateCropRectangleEndPoint(point.x - canvasOffset.x, point.y - canvasOffset.y);
        this._dragOverlay();
    }

    e.preventDefault();
};

CanvasCropper.prototype._onMouseUp = function() {
    if (this._dragging && this._enabled) {
        this._dragging = false;

        if (this._autoCapture) {
            this.disable();
            this._handleCallback();
        }
    }
};

CanvasCropper.prototype._handleCallback = function() {
    this._callback.call(this, this._getImageAsUrl(), this._getCroppedImageData());
};

CanvasCropper.prototype._setupCanvas = function() {
    this.previousCursor = this._canvas.style.cursor;
    this._canvas.style.cursor = "crosshair";
};

CanvasCropper.prototype._restoreCanvas = function() {
    this._canvas.style.cursor = this.previousCursor || "";
};

CanvasCropper.prototype._dragOverlay = function() {
    this._overlay.style.width = this._shadowOverlay.width + 'px';
    this._overlay.style.height = this._shadowOverlay.height + 'px';
    this._overlay.style.left = this._shadowOverlay.left + 'px';
    this._overlay.style.top = this._shadowOverlay.top + 'px';
};

CanvasCropper.prototype._getImageAsUrl = function() {
    this.croppedImageData = this._getCroppedImageData();

    var tempCanvas = document.createElement("canvas");
    tempCanvas.width = this._cropRectangle.width;
    tempCanvas.height = this._cropRectangle.height;
    tempCanvas.getContext("2d").putImageData(this.croppedImageData, 0, 0);

    return tempCanvas.toDataURL();
};

CanvasCropper.prototype._getCroppedImageData = function() {
    var cr = this._cropRectangle;
    return this._context.getImageData(cr.x1, cr.y1, cr.x2, cr.y2);
};

CanvasCropper.prototype._setCropRectangleStartPoint = function(x1, y1) {
    this._cropRectangle.x1 = x1;
    this._cropRectangle.y1 = y1;
};

CanvasCropper.prototype._setShadowOverlayStartPoint = function(x1, y1) {
    this._shadowOverlay.x1 = x1;
    this._shadowOverlay.y1 = y1;
};

CanvasCropper.prototype._updateCropRectangleEndPoint = function(x2, y2) {
    this._cropRectangle.x2 = x2 - this._cropRectangle.x1;
    this._cropRectangle.y2 = y2 - this._cropRectangle.y1;
    this._cropRectangle.width = Math.abs(x2 - this._cropRectangle.x1);
    this._cropRectangle.height = Math.abs(y2 - this._cropRectangle.y1);
    this._cropRectangle.left = (x2 - this._cropRectangle.x1 < 0) ? x2 : this._cropRectangle.x1;
    this._cropRectangle.top = (y2 - this._cropRectangle.y1 < 0) ? y2 : this._cropRectangle.y1;
};

CanvasCropper.prototype._updateShadowOverlayEndPoint = function(x2, y2) {
    this._shadowOverlay.x2 = x2 - this._shadowOverlay.x1;
    this._shadowOverlay.y2 = y2 - this._shadowOverlay.y1;
    this._shadowOverlay.width = Math.abs(x2 - this._shadowOverlay.x1);
    this._shadowOverlay.height = Math.abs(y2 - this._shadowOverlay.y1);
    this._shadowOverlay.left = (x2 - this._shadowOverlay.x1 < 0) ? x2 : this._shadowOverlay.x1;
    this._shadowOverlay.top = (y2 - this._shadowOverlay.y1 < 0) ? y2 : this._shadowOverlay.y1;
};

QuirksMode = {
    getAbsolutePoint: function(e, element) {
        var x = 0;
        var y = 0;
        if (!e) var e = window.event;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else if (e.clientX || e.clientY) {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        return {
            x: x,
            y: y
        };
    },
    getElementOffsetPoint: function(element) {
        return {
            x: element.offsetLeft,
            y: element.offsetTop
        };
    },
};
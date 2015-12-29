canvas-cropper
==============

easily crop a canvas image

#Usage

##With callback

    function openImageInNewWindow(dataUri) {
        var newWindow = window.open()
        newWindow.document.write('<img src="' + dataUri + '"></img>');
    };
    new CanvasCropper(canvas)
        .capture(function(dataUri, canvasData) {
            openImageInNewWindow(dataUri);
        });

##Without callback

    function openImageInNewWindow(dataUri) {
        var newWindow = window.open()
        newWindow.document.write('<img src="' + dataUri + '"></img>');
    };
    var canvasCropper = new CanvasCropper(canvas).capture();
    function getCanvasCroppedImage() {
        openImageInNewWindow(canvasCropper.getCroppedImage());
    };

#[Demo](http://dclaze.github.io/canvas-cropper/demo.html)

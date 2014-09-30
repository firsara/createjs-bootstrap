setPackage('com.firsara.display');

com.firsara.display.ScaleClip = (function(){
  var Parent = com.firsara.display.Transformable;

  var SCALE = 'scale';
  var SCALE_COMPLETE = 'scaleComplete';

  var ScaleClip = function(){
    // instance
    var self = this;

    // private variables
    var _tween = null;

    // constructor
    var Init = function(){
      // call super constructor, only if instance is not a mixin of another class
      if (Parent && ! self._initialized) Parent.call(self);

      self.borders.scale = [];
      self.fraction.move.scale = 1;
      self.fraction.release.scale = 1;

      self.addEventListener('start', _startTransform);
      self.addEventListener('update', _update);
      self.addEventListener('pressup', _stopTransform);
    };

    var _holdBorders = function(){
      if (! self.free.scale) {
        if      (self.scaleX < self.borders.scale[0]) { self.scaleX = self.borders.scale[0]; self.scaleY = self.borders.scale[0]; }
        else if (self.scaleX > self.borders.scale[1]) { self.scaleX = self.borders.scale[1]; self.scaleY = self.borders.scale[1]; }
      }
    };

    var _stopTween = function(){
      if (_tween) {
        _tween.kill();
        _tween = null;
      }
    };

    var _dispatchTweenUpdate = function(){
      _holdBorders();

      if (self.lock) {
        _stopTween();
      }

      self.dispatchEvent(SCALE);
    };

    var _startTransform = function(event){
      if (self._activeFingers > 1) {
        _stopTween();
      }
    };

    var _dispatchScaleComplete = function(){
      self.dispatchEvent(SCALE_COMPLETE);
    };

    var _getDistance = function(p1, p2) {
      var x = p2.x - p1.x;
      var y = p2.y - p1.y;

      return Math.sqrt((x * x) + (y * y));
    };

    var _update = function(event){
      if (self.lock) return;

      if (self._activeFingers > 1) {
        _stopTween();

        var points = [];

        for (var k in self._fingers) {
          if (self._fingers[k].current) {
            points.push(self._fingers[k]);
            if (points.length >= 2) break;
          }
        }

        var scale = _getDistance(points[0].current, points[1].current) / _getDistance(points[0].old, points[1].old);

        self.scaleX += ((scale - 1) * self.fraction.move.rotation * self.fraction.base);
        self.scaleY = self.scaleX;

        _holdBorders();

        self.dispatchEvent(SCALE);
      }
    };

    var _stopTransform = function(){
      if (self.lock) return;

      if (self._stack.length == 0 || typeof TweenLite === 'undefined') {
        _dispatchScaleComplete();
      } else if (! (typeof TweenLite === 'undefined')) {
        var options = {};
        var average = {scaleX: 0, scaleY: 0};
        var newPosition = {scaleX: 0, scaleY: 0};

        for (var i = 1, _len = self._stack.length; i < _len; i++) {
          average.scaleX += (self._stack[i].scaleX - self._stack[i-1].scaleX);
          average.scaleY += (self._stack[i].scaleY - self._stack[i-1].scaleY);
        }

        average.scaleX = average.scaleX / self._stack.length;
        average.scaleY = average.scaleY / self._stack.length;

        var fade = 10;

        var speed = 1 * self.fraction.release.scale * self.fraction.base;

        options.scaleX = self.scaleX + average.scaleX * self.fraction.release.scale * self.fraction.base * fade;
        options.scaleY = self.scaleY + average.scaleY * self.fraction.release.scale * self.fraction.base * fade;

        if (self.snap.scale && self.snap.scale != 0) {
          options.scaleX = (Math.round(options.scaleX / self.snap.scale) * self.snap.scale);
          options.scaleY = (Math.round(options.scaleY / self.snap.scale) * self.snap.scale);
        }

        if (! self.free.scale) {
          if      (options.scaleX < self.borders.scale[0]) { options.scaleX = self.borders.scale[0]; options.scaleY = self.borders.scale[0]; }
          else if (options.scaleX > self.borders.scale[1]) { options.scaleX = self.borders.scale[1]; options.scaleY = self.borders.scale[1]; }
        }

        options.ease = Cubic.easeOut;
        options.onComplete = _dispatchScaleComplete;
        options.onUpdate = _dispatchTweenUpdate;
        options.overwrite = 'auto';

        _stopTween();
        _tween = TweenLite.to(self, speed, options);
      }
    };

    // initialize instance
    Init();
  };

  // export public ScaleClip definition
  ScaleClip.prototype = {};

  // extend ScaleClip with defined parent
  if (Parent) sys.inherits(ScaleClip, Parent);

  // return ScaleClip definition to public scope
  return ScaleClip;
})();
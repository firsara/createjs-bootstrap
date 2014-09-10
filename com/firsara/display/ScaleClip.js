// TODO: adjust borders to take rotation and scaling in account
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
      if (Parent && ! self.borders) Parent.call(self);

      self.borders.scale = [];

      self.addEventListener('start', _startTransform);
      self.addEventListener('update', _update);
      self.addEventListener('pressup', _stopTransform);
    };

    var _holdBorders = function(){
      if (! self.free) {
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
      if (self.activeFingers > 1) {
        if (_tween) {
          _tween.kill();
          _tween = null;
        }
      }
    };

    var _dispatchRotationComplete = function(){
      self.dispatchEvent(SCALE_COMPLETE);
    };

    var _getDistance = function(p1, p2) {
      var x = p2.x - p1.x;
      var y = p2.y - p1.y;

      return Math.sqrt((x * x) + (y * y));
    }

    var _update = function(event){
      if (self.lock) return;

      if (self.activeFingers > 1) {
        var points = [];

        for (var k in self.fingers) {
          if (self.fingers[k].current) {
            points.push(self.fingers[k]);
            if (points.length >= 2) break;
          }
        }

        var scale = _getDistance(points[0].current, points[1].current) / _getDistance(points[0].old, points[1].old);

        // NOTE: make scaling proportional to element size
        self.scaleX += (scale - 1);
        self.scaleY = self.scaleX;

        _holdBorders();

        self.dispatchEvent(SCALE);
      }
    };

    var _stopTransform = function(){
      if (self.lock) return;

      if (self.stack.length == 0 || typeof TweenLite === 'undefined') {
        _dispatchRotationComplete();
      } else if (! (typeof TweenLite === 'undefined')) {
        var options = {};
        var average = {scaleX: 0, scaleY: 0};
        var newPosition = {scaleX: 0, scaleY: 0};

        for (var i = 1, _len = self.stack.length; i < _len; i++) {
          average.scaleX += (self.stack[i].scaleX - self.stack[i-1].scaleX);
          average.scaleY += (self.stack[i].scaleY - self.stack[i-1].scaleY);
        }

        average.scaleX = average.scaleX / self.stack.length;
        average.scaleY = average.scaleY / self.stack.length;

        var speed = 0.6 + .01 * Math.abs((average.scaleX + average.scaleY) / 2) * 2 * (self.friction.release + self.friction.release) / 4;
        options.scaleX = self.scaleX + average.scaleX * Math.max(10, Math.abs(average.scaleX / 10)) * self.friction.release / 2;
        options.scaleY = self.scaleY + average.scaleY * Math.max(10, Math.abs(average.scaleY / 10)) * self.friction.release / 2;

        if (self.snap && self.snap != 0) {
          options.scaleX = (Math.round(options.y / self.snap) * self.snap);
          options.scaleY = (Math.round(options.y / self.snap) * self.snap);
        }

        // TODO:
        // check for borders!

        options.ease = Cubic.easeOut;
        options.onComplete = _dispatchRotationComplete;
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
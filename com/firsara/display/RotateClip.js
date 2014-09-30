setPackage('com.firsara.display');

com.firsara.display.RotateClip = (function(){
  var Parent = com.firsara.display.Transformable;

  var ROTATE = 'rotate';
  var ROTATE_COMPLETE = 'rotateComplete';

  var RotateClip = function(){
    // instance
    var self = this;

    // private variables
    var _tween = null;

    // constructor
    var Init = function(){
      // call super constructor, only if instance is not a mixin of another class
      if (Parent && ! self._initialized) Parent.call(self);

      self.borders.rotation = [];
      self.fraction.move.rotation = 1;
      self.fraction.release.rotation = 1;

      self.addEventListener('start', _startTransform);
      self.addEventListener('update', _update);
      self.addEventListener('pressup', _stopTransform);
    };

    var _holdBorders = function(){
      if (! self.free.rotation) {
        if      (self.rotation < self.borders.rotation[0]) self.rotation = self.borders.rotation[0];
        else if (self.rotation > self.borders.rotation[1]) self.rotation = self.borders.rotation[1];
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

      self.dispatchEvent(ROTATE);
    };

    var _startTransform = function(event){
      if (self._activeFingers > 1) {
        _stopTween();
      }
    };

    var _dispatchRotationComplete = function(){
      self.dispatchEvent(ROTATE_COMPLETE);
    };

    var _update = function(event){
      if (self.lock) return;

      if (self._activeFingers > 1) {
        _stopTween();

        var points = [];

        // extract touchpoints
        for (var k in self._fingers) {
          if (self._fingers[k].current) {
            points.push(self._fingers[k]);
            if (points.length >= 2) break;
          }
        }

        // calculate initial angle
        var point1 = points[0].old;
        var point2 = points[1].old;
        var startAngle = Math.atan2((point1.y - point2.y), (point1.x - point2.x)) * (180/Math.PI);

        // calculate new angle
        var point1 = points[0].current;
        var point2 = points[1].current;
        var currentAngle = Math.atan2((point1.y - point2.y), (point1.x - point2.x)) * (180/Math.PI);

        // set rotation based on difference between the two angles
        self.rotation += ((currentAngle - startAngle) * self.fraction.move.rotation * self.fraction.base);

        _holdBorders();

        self.dispatchEvent(ROTATE);
      }
    };

    var _stopTransform = function(){
      if (self.lock) return;

      if (self._stack.length == 0 || typeof TweenLite === 'undefined') {
        _dispatchRotationComplete();
      } else if (! (typeof TweenLite === 'undefined')) {
        var options = {};
        var average = {rotation: 0};
        var newPosition = {rotation: 0};

        for (var i = 1, _len = self._stack.length; i < _len; i++) {
          average.rotation += (self._stack[i].rotation - self._stack[i-1].rotation);
        }

        average.rotation = average.rotation / self._stack.length;

        var fade = 10;

        var speed = 1 * self.fraction.release.rotation * self.fraction.base;

        options.rotation = self.rotation + average.rotation * self.fraction.release.rotation * self.fraction.base * fade;

        if (self.snap.rotation && self.snap.rotation != 0) {
          options.rotation = (Math.round(options.y / self.snap.rotation) * self.snap.rotation);
        }

        if (! self.free.rotation) {
          if      (options.rotation < self.borders.rotation[0]) options.rotation = self.borders.rotation[0];
          else if (options.rotation > self.borders.rotation[1]) options.rotation = self.borders.rotation[1];
        }

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

  // export public RotateClip definition
  RotateClip.prototype = {};

  // extend RotateClip with defined parent
  if (Parent) sys.inherits(RotateClip, Parent);

  // return RotateClip definition to public scope
  return RotateClip;
})();
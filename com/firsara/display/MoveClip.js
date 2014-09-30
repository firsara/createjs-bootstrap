/*
 * MoveClip container child class
 * add tweenlite to add movement-fadeout
 * usage:
 * var element = new com.firsara.display.MoveClip();
 * element.addChild(bitmap);
 * element.snap = 1;
 * element.borders.x = [0, stage.canvas.width];
 * element.borders.y = [0, stage.canvas.height];
 */

setPackage('com.firsara.display');

com.firsara.display.MoveClip = (function(){
  var Parent = com.firsara.display.Transformable;

  var MOVE = 'move';
  var MOVE_COMPLETE = 'moveComplete';

  var MoveClip = function(){
    // reference to instance
    var self = this;

    // layer active moveclip to top
    self.level = false;

    // stored fade-out-tween
    var _tween = null;

    // constructor
    var Init = function(){
      // call super constructor, only if instance is not a mixin of another class
      if (Parent && ! self._initialized) Parent.call(self);

      self.borders.x = [];
      self.borders.y = [];

      self.fraction.move.x = 1;
      self.fraction.move.y = 1;

      self.fraction.release.x = 1;
      self.fraction.release.y = 1;

      self.addEventListener('start', _startTransform);
      self.addEventListener('update', _update);
      self.addEventListener('pressup', _stopTransform);
    };

    self.moveTo = function(x, y, ease){
      if (! (typeof TweenLite === 'undefined')) {
        var options = {};
        var speed = 0.45 + .01 * ((self.fraction.release.x + self.fraction.release.y) / 2) * self.fraction.base;

        if (! isNaN(x)) options.x = x;
        if (! isNaN(y)) options.y = y;
        if (ease) options.ease = ease;
        else options.ease = Cubic.easeOut;
        options.onComplete = _dispatchMoveComplete;
        options.onUpdate = _dispatchTweenUpdate;
        options.overwrite = 'auto';

        _stopTween();
        _tween = TweenLite.to(self, speed, options);
      }
    };

    self.getAcceleration = function(){
      var average = {x: 0, y: 0};

      if (self._stack && self._stack.length) {
        for (var i = 1, _len = self._stack.length; i < _len; i++) {
          average.x += (self._stack[i].x - self._stack[i-1].x);
          average.y += (self._stack[i].y - self._stack[i-1].y);
        }

        average.x /= self._stack.length;
        average.y /= self._stack.length;
      }

      var speed = 0 + Math.max(0, .1 * Math.abs((average.x + average.y) / 2));

      return speed;
    };

    var _holdBorders = function(){
      if (! self.free.x) {
        if      (self.x < self.borders.x[0]) self.x = self.borders.x[0];
        else if (self.x > self.borders.x[1]) self.x = self.borders.x[1];
      }

      if (! self.free.y) {
        if      (self.y < self.borders.y[0]) self.y = self.borders.y[0];
        else if (self.y > self.borders.y[1]) self.y = self.borders.y[1];
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

      self.dispatchEvent(MOVE);
    };

    var _dispatchMoveComplete = function(){
      self.dispatchEvent(MOVE_COMPLETE);
    };

    var _startTransform = function(event){
      _stopTween();
      if (self.level && self.parent) self.parent.setChildIndex(self, self.parent.getNumChildren() - 1);
    };

    var _update = function(event){
      if (self.lock) return;

      var average = {x: 0, y: 0};

      for (var pointerID in self._fingers) {
        if (self._fingers[pointerID].start) {
          average.x += (self._fingers[pointerID].current.x - self._fingers[pointerID].old.x);
          average.y += (self._fingers[pointerID].current.y - self._fingers[pointerID].old.y);
        }
      }

      average.x /= Math.max(1, self._activeFingers);
      average.y /= Math.max(1, self._activeFingers);

      self.x += (average.x * self.fraction.move.x * self.fraction.base);
      self.y += (average.y * self.fraction.move.y * self.fraction.base);

      _holdBorders();

      self.dispatchEvent(MOVE);
    };

    var _stopTransform = function(event){
      if (self.lock) return;

      if (self._stack.length == 0 || typeof TweenLite === 'undefined') {
        _dispatchMoveComplete();
      } else if (! (typeof TweenLite === 'undefined')) {
        var options = {};
        var average = {x: 0, y: 0};
        var newPosition = {x: 0, y: 0};

        for (var i = 1, _len = self._stack.length; i < _len; i++) {
          average.x += (self._stack[i].x - self._stack[i-1].x);
          average.y += (self._stack[i].y - self._stack[i-1].y);
        }

        average.x = average.x / self._stack.length;
        average.y = average.y / self._stack.length;

        var fade = 10;

        var speed = 1 * ((self.fraction.release.x + self.fraction.release.y) / 2) * self.fraction.base;

        options.x = self.x + average.x * self.fraction.release.x * self.fraction.base * fade;
        options.y = self.y + average.y * self.fraction.release.y * self.fraction.base * fade;

        if (self.snap.x && self.snap.x != 0) {
          options.x = (Math.round(options.x / self.snap) * self.snap);
        }

        if (self.snap.y && self.snap.y != 0) {
          options.y = (Math.round(options.y / self.snap) * self.snap);
        }

        if (! self.free.x) {
          if      (options.x < self.borders.x[0]) options.x = self.borders.x[0];
          else if (options.x > self.borders.x[1]) options.x = self.borders.x[1];
        }

        if (! self.free.y) {
          if      (options.y < self.borders.y[0]) options.y = self.borders.y[0];
          else if (options.y > self.borders.y[1]) options.y = self.borders.y[1];
        }

        options.ease = Cubic.easeOut;
        options.onComplete = _dispatchMoveComplete;
        options.onUpdate = _dispatchTweenUpdate;
        options.overwrite = 'auto';

        _stopTween();
        _tween = TweenLite.to(self, speed, options);
      }
    };

    // initialize instance
    Init();
  };

  // export public MoveClip definition
  MoveClip.prototype = {};

  // extend MoveClip with defined parent
  if (Parent) sys.inherits(MoveClip, Parent);

  // return MoveClip definition to public scope
  return MoveClip;
})();
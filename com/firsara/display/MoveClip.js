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

// TODO: dispatch better events!
// TODO: snap, lock, free each specific to transformed value

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

    // numeric value to snap movement to x pixels
    self.snap = null;
    // moveable free around entire stage, overwrites borders if true
    self.free = false;

    // stored fade-out-tween
    var _tween = null;

    // constructor
    var Init = function(){
      // call super constructor, only if instance is not a mixin of another class
      if (Parent && ! self.borders) Parent.call(self);

      self.borders.x = [];
      self.borders.y = [];

      self.addEventListener('start', _startTransform);
      self.addEventListener('update', _update);
      self.addEventListener('pressup', _stopTransform);
    };

    self.moveTo = function(x, y, ease){
      if (! (typeof TweenLite === 'undefined')) {
        var options = {};
        var speed = 0.45 + .01 * self.friction.release;

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

      if (self.stack && self.stack.length) {
        for (var i = 0, _len = self.stack.length; i < _len; i++) {
          average.x += self.stack[i].x;
          average.y += self.stack[i].y;
        }

        average.x /= self.stack.length;
        average.y /= self.stack.length;
      }

      var speed = 0 + Math.max(0, .1 * Math.abs((average.x + average.y) / 2));

      return speed;
    };

    var _holdBorders = function(){
      if (! self.free) {
        if      (self.x < self.borders.x[0]) self.x = self.borders.x[0];
        else if (self.x > self.borders.x[1]) self.x = self.borders.x[1];

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

      for (var pointerID in self.fingers) {
        if (self.fingers[pointerID].start) {
          average.x += (self.fingers[pointerID].current.x - self.fingers[pointerID].old.x);
          average.y += (self.fingers[pointerID].current.y - self.fingers[pointerID].old.y);
        }
      }

      average.x /= Math.max(1, self.activeFingers);
      average.y /= Math.max(1, self.activeFingers);

      self.x += (average.x * self.friction.move);
      self.y += (average.y * self.friction.move);

      _holdBorders();

      self.dispatchEvent(MOVE);
    };

    var _stopTransform = function(event){
      if (self.lock) return;

      if (self.stack.length == 0 || typeof TweenLite === 'undefined') {
        _dispatchMoveComplete();
      } else if (! (typeof TweenLite === 'undefined')) {
        var options = {};
        var average = {x: 0, y: 0};
        var newPosition = {x: 0, y: 0};

        for (var i = 1, _len = self.stack.length; i < _len; i++) {
          average.x += (self.stack[i].x - self.stack[i-1].x);
          average.y += (self.stack[i].y - self.stack[i-1].y);
        }

        average.x = average.x / self.stack.length;
        average.y = average.y / self.stack.length;

        var speed = 0.6 + .01 * Math.abs((average.x + average.y) / 2) * 2 * (self.friction.release + self.friction.release) / 4;
        options.x = self.x + average.x * Math.max(10, Math.abs(average.x / 10)) * self.friction.release / 2;
        options.y = self.y + average.y * Math.max(10, Math.abs(average.y / 10)) * self.friction.release / 2;

        if (self.snap && self.snap != 0) {
          options.x = (Math.round(options.x / self.snap) * self.snap);
          options.y = (Math.round(options.y / self.snap) * self.snap);
        }

        // TODO:
        // check for borders!

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
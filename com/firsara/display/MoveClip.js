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
  var Parent = createjs.Container;

  // constants
  var STACK_MOVE = 4;

  var MoveClip = function(){
    // reference to instance
    var self = this;

    // numeric value to snap movement to x pixels
    self.snap = null;
    // moveable free around entire stage, overwrites borders if true
    self.free = false;
    // layer active moveclip to top
    self.level = false;
    // lock movement regardless of other values
    self.lock = false;
    // constraint movement to [-x, x] / [-y, y]
    self.borders = {x: [], y: []};
    // lower / higher movement through frictions
    self.friction = {move: 1, release: 1};

    // private variables
    var _store = {
      oldPosition: {x: 0, y: 0},
      position: {x: 0, y: 0},
      move: [],
      tween: null
    };

    // constructor
    var Init = function(){
      self.addEventListener('mousedown', startDrag);
      self.addEventListener('pressmove', pressMove);
      self.addEventListener('pressup', fadeMove);
      self.addEventListener('tick', storeMove);
    };

    self.moveTo = function(x, y, ease){
      if (! (typeof TweenLite === 'undefined')) {
        var options = {};
        var speed = 0.45 + .01 * self.friction.release;

        if (! isNaN(x)) options.x = x;
        if (! isNaN(y)) options.y = y;
        if (ease) options.ease = ease;
        else options.ease = Cubic.easeOut;
        options.onComplete = dispatchComplete;

        _store.tween = TweenLite.to(self, speed, options);
      }
    };

    self.holdBorders = function(){
      if (self.lock) return;

      if (! self.free) {
        if      (self.x < self.borders.x[0]) self.x = self.borders.x[0];
        else if (self.x > self.borders.x[1]) self.x = self.borders.x[1];

        if      (self.y < self.borders.y[0]) self.y = self.borders.y[0];
        else if (self.y > self.borders.y[1]) self.y = self.borders.y[1];
      }
    };

    self.getAcceleration = function(){
      var average = {x: 0, y: 0};

      if (_store.move && _store.move.length) {
        for (var i = 0, _len = _store.move.length; i < _len; i++) {
          average.x += _store.move[i].x;
          average.y += _store.move[i].y;
        }

        average.x /= _store.move.length;
        average.y /= _store.move.length;
      }

      var speed = 0 + Math.max(0, .1 * Math.abs((average.x + average.y) / 2));

      return speed;
    };

    var dispatchUpdate = function(){
      self.dispatchEvent('update');
    };

    var dispatchComplete = function(){
      _store.move = [];
      self.dispatchEvent('complete');
    };

    var startDrag = function(e){
      if (_store.tween) {
        _store.tween.kill();
        _store.tween = null;
      }

      if (self.level && self.parent) self.parent.setChildIndex(self, self.parent.getNumChildren() - 1);

      _store.position.x = e.stageX;
      _store.position.y = e.stageY;
    };

    var pressMove = function(e){
      if (self.lock) return;

      var distance = {x: e.stageX - _store.position.x, y: e.stageY - _store.position.y};

      self.x += (distance.x * self.friction.move);
      self.y += (distance.y * self.friction.move);

      _store.position.x = e.stageX;
      _store.position.y = e.stageY;
    };

    // check position update every frame
    var storeMove = function(){
      if (self.lock) return;

      var distance = {x: self.x - _store.oldPosition.x, y: self.y - _store.oldPosition.y};

      if (! (distance.x == 0 && distance.y == 0)) {
        if (self.lock && _store.tween) {
          _store.tween.kill();
          _store.tween = null;
        }

        self.holdBorders();
        dispatchUpdate();
      }

      if (_store.move.length > STACK_MOVE) _store.move.shift();

      _store.move.push(distance);
      _store.oldPosition.x = self.x;
      _store.oldPosition.y = self.y;
    };

    var fadeMove = function(){
      if (! (typeof TweenLite === 'undefined')) {
        if (self.lock) return;

        if (_store.move.length == 0) {
          dispatchComplete();
          return;
        }

        var speed = 0;
        var options = {};
        var average = {x: 0, y: 0};
        var newPosition = {x: 0, y: 0};

        for (var i = 0, _len = _store.move.length; i < _len; i++) {
          average.x += _store.move[i].x;
          average.y += _store.move[i].y;
        }

        average.x = average.x / _store.move.length;
        average.y = average.y / _store.move.length;

        speed = 0.6 + .01 * Math.abs((average.x + average.y) / 2) * 2 * (self.friction.release + self.friction.release) / 4;
        newPosition.x = self.x + average.x * Math.max(10, Math.abs(average.x / 10)) * self.friction.release / 2;
        newPosition.y = self.y + average.y * Math.max(10, Math.abs(average.y / 10)) * self.friction.release / 2;

        if (self.snap && self.snap != 0)
        {
          newPosition.x = (Math.round(newPosition.x / self.snap) * self.snap);
          newPosition.y = (Math.round(newPosition.y / self.snap) * self.snap);
        }

        options.x = newPosition.x;
        options.y = newPosition.y;
        options.ease = Cubic.easeOut;
        options.onComplete = dispatchComplete;

        _store.tween = TweenLite.to(self, speed, options);
      } else {
        dispatchComplete();
      }
    };

    // call super constructor
    if (Parent) Parent.call(this);
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
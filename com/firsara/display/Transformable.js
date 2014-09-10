/*
 * Transformable container base class for transforming shapes
 * keeps track of fingers, sub-classes can calculate values based on finger positions
 *
 * dispatches events:
 * start, update, complete
 */

setPackage('com.firsara.display');

com.firsara.display.Transformable = (function(){
  var Parent = createjs.Container;

  // Stack x finger movements together for fading out transforms
  var STACK = 5;
  var START = 'start';
  var UPDATE = 'update';
  // TODO: change complete event to something else which pops more!
  var COMPLETE = 'complete';

  var Transformable = function(){
    // reference to instance
    var self = this;

    // borders for specific values get stored here
    self.borders = {};
    // lock movement regardless of other values
    self.lock = false;

    // NOTE: read-only, don't modify from outside!
    // currently active fingers
    self.activeFingers = 0;
    // finger positions
    self.fingers = [];
    // stored movements, updated on every tick
    self.stack = [];
    // TODO: rename child values
    // lower / higher movement through frictions
    self.friction = {move: 1, release: 1};

    var _changed = false;

    // constructor
    var Init = function(){
      // call super constructor
      if (Parent) Parent.call(self);

      self.addEventListener('mousedown', _mousedown);
      self.addEventListener('pressmove', _pressmove);
      self.addEventListener('pressup', _pressup);
      self.addEventListener('tick', _enterFrame);
    };

    var _mousedown = function(event){
      if (! event.pointerID) event.pointerID = -1;

      self.fingers[event.pointerID] = {
        start: {x: event.stageX, y: event.stageY},
        current: {x: event.stageX, y: event.stageY},
        old: {x: event.stageX, y: event.stageY}
      };

      self.dispatchEvent(START);
    };

    var _pressmove = function(event){
      if (! event.pointerID) event.pointerID = -1;

      self.fingers[event.pointerID].current.x = event.stageX;
      self.fingers[event.pointerID].current.y = event.stageY;

      _calculateActiveFingers();

      _changed = true;
    };

    var _enterFrame = function(){
      if (_changed) {
        self.dispatchEvent(UPDATE);

        for (var pointerID in self.fingers) {
          if (self.fingers[pointerID].start) {
            self.fingers[pointerID].old.x = self.fingers[pointerID].current.x;
            self.fingers[pointerID].old.y = self.fingers[pointerID].current.y;
          }
        }
      }

      var stack = {};
      stack.x = self.x;
      stack.y = self.y;
      stack.scaleX = self.scaleX;
      stack.scaleY = self.scaleY;
      stack.rotation = self.rotation;

      // auto-stack container-properties regardless of use in subclasses
      if (self.stack.length > STACK) self.stack.shift();
      self.stack.push(stack);
    };

    var _pressup = function(event){
      if (! event.pointerID) event.pointerID = -1;

      if (self.fingers[event.pointerID]) {
        delete(self.fingers[event.pointerID]);
      }

      _calculateActiveFingers();

      self.dispatchEvent(COMPLETE);
    };


    var _calculateActiveFingers = function(){
      self.activeFingers = 0;

      for (var pointerID in self.fingers) {
        if (self.fingers[pointerID].start) {
          self.activeFingers++;
        }
      }
    };

    // initialize instance
    Init();
  };

  // export public Transformable definition
  Transformable.prototype = {};

  // extend Transformable with defined parent
  if (Parent) sys.inherits(Transformable, Parent);

  // return Transformable definition to public scope
  return Transformable;
})();
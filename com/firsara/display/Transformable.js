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
  var COMPLETE = 'complete';

  var Transformable = function(){
    // reference to instance
    var self = this;

    // fractions:
    // move: how much finger movements transform
    // release: how much fade-out tweening after releasing fingers transform
    self.fraction = {base: 1, move: {}, release: {}};

    // numeric value to snap transformation by x
    self.snap = {};

    // freely transformable by property, overwrites borders if true
    self.free = {};

    // borders for specific values get stored here
    self.borders = {};

    // lock transformations regardless of other values
    self.lock = false;


    // protected values
    // NOTE: read-only, don't modify from outside!
    // currently active fingers
    self._activeFingers = 0;

    // finger positions
    self._fingers = [];

    // stored movements, updated on every tick
    self._stack = [];

    var _changed = false;

    // constructor
    var Init = function(){
      // call super constructor
      if (Parent) Parent.call(self);

      self._initialized = true;

      self.addEventListener('mousedown', _mousedown);
      self.addEventListener('pressmove', _pressmove);
      self.addEventListener('pressup', _pressup);
      self.addEventListener('tick', _enterFrame);
    };

    // store initial touchpoint-position
    var _mousedown = function(event){
      if (! event.pointerID) event.pointerID = -1;

      self._fingers[event.pointerID] = {
        start: {x: event.stageX, y: event.stageY},
        current: {x: event.stageX, y: event.stageY},
        old: {x: event.stageX, y: event.stageY}
      };

      _calculateActiveFingers();

      self.dispatchEvent(START);
    };

    // update touchpoint-positions
    var _pressmove = function(event){
      if (! event.pointerID) event.pointerID = -1;

      self._fingers[event.pointerID].current.x = event.stageX;
      self._fingers[event.pointerID].current.y = event.stageY;

      _calculateActiveFingers();

      _changed = true;
    };

    // if positions changed (through pressmove): dispatch update-event for later usage and keep track of old point-position
    // dispatch updates only on tick to save some performance
    var _enterFrame = function(){
      if (_changed) {
        _changed = false;
        self.dispatchEvent(UPDATE);

        for (var pointerID in self._fingers) {
          if (self._fingers[pointerID].start) {
            self._fingers[pointerID].old.x = self._fingers[pointerID].current.x;
            self._fingers[pointerID].old.y = self._fingers[pointerID].current.y;
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
      if (self._stack.length > STACK) self._stack.shift();
      self._stack.push(stack);
    };

    // delete old and unused finger-positions
    var _pressup = function(event){
      if (! event.pointerID) event.pointerID = -1;

      if (self._fingers[event.pointerID]) {
        delete(self._fingers[event.pointerID]);
      }

      _calculateActiveFingers();

      self.dispatchEvent(COMPLETE);
    };

    // calculates currently active fingers, can be used later in subclasses
    var _calculateActiveFingers = function(){
      self._activeFingers = 0;

      for (var pointerID in self._fingers) {
        if (self._fingers[pointerID].start) {
          self._activeFingers++;
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
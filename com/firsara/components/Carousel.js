/*
TODO: create public "replace" method to replace an element at index X
This way a preloader is possible
NOTE: maybe even expose a preload function (with defined element box sizes)
TODO: create add function to add elements to carousel
TODO: don't use stage!!!!!
NOTE: create moveclip underneath, paint onto moveclip to make use of mouse-events

TODO: create module base class and template base class
TODO: create component base class and inherit from it!

TODO: make it either vertical OR horizontal
TODO: stack movement every frame and tween by that average value

TODO: new functions: getId(), setId(), removeAt(index), remove(element), insertAt(element, index)
 */

setPackage('com.firsara.components');

com.firsara.components.Carousel = (function(){
  var Parent = createjs.Container;

  var Public = {};

  var HIDE_PERCENTAGE = .2;

  function sortByKey(array, key) {
    return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }

  var Carousel = function(){
    // instance
    var self = this;

    // NOTE: create invisible CACHED background that uses events rather than stage
    // NOTE: create public API setWidth; setHeight and resize() to define size

    self.elements = [];

    self.container = new createjs.Container3d();
    var _background = new createjs.Container();

    var _containerWidth = 0;
    var _containerHeight = 0;

    var _offset = {x: 0, y: 0};
    var _oldPosition = {};
    var _moveFraction = 1;
    var _degreeStep = 0;

    var _i = 0;
    var _count = 0;
    var _sorting = null;
    var _element = null;
    var _degree = null;
    var _snap = 0;

    var _tween = null;

    // constructor
    var Init = function(){
      // call super constructor
      if (Parent) Parent.call(self);

      self.addChild(_background);
      self.addChild(self.container);

      self.addEventListener('addedToStage', _render);
      self.addEventListener('removedFromStage', _dispose);
    };

    self.add = function(element){
      self.elements.push(element);
      self.render();
    };

    self.render = function(){
      if (self.elements.length == 0) return;

      _count = self.elements.length;
      _degreeStep = (Math.PI * 2) / _count;
      _snap = _degreeStep * _containerWidth / _degreeStep / 3;

      while (self.container.getNumChildren() > 0) self.container.removeChildAt(0);

      for (var i = 0; i < _count; i++) {
        var element = self.elements[i];
        self.container.addChild(self.elements[i]);
      }

      _rearrange();
    };

    self.resize = function(width, height){
      _containerWidth = width;
      _containerHeight = height;

      self.container.perspectiveProjection.projectionCenter.x = _containerWidth / 2;
      self.container.perspectiveProjection.projectionCenter.y = _containerHeight / 2;

      while (_background.getNumChildren() > 0) _background.removeChildAt(0);

      var fill = new createjs.Shape();
      fill.graphics.beginFill('#F00');
      fill.alpha = 0;
      fill.graphics.drawRect(0, 0, _containerWidth, _containerHeight);
      fill.graphics.endFill();

      _background.addChild(fill);
      _background.cache(0, 0, _containerWidth, _containerHeight);
      fill.alpha = 1;

      self.render();
    };

    var _render = function(){
      self.addEventListener('mousedown', _startDrag);
      self.render();
    };

    var _dispose = function(){
      self.removeEventListener('mousedown', _startDrag);
      self.stage.removeEventListener('stagemouseup', _stopDrag);
      self.stage.removeEventListener('stagemousemove', _drag);
    };

    var _startDrag = function(event){
      if (_tween) {
        _tween.kill();
        _tween = null;
      }

      _offset.startX = _offset.x;
      _offset.startY = _offset.y;

      _oldPosition.x = event.stageX;
      _oldPosition.y = event.stageY;

      self.stage.addEventListener('stagemouseup', _stopDrag);
      self.stage.addEventListener('stagemousemove', _drag);
    };

    var _stopDrag = function(event){
      self.stage.removeEventListener('stagemouseup', _stopDrag);
      self.stage.removeEventListener('stagemousemove', _drag);

      // calculate movement
      var speed = 1;

      var options = {};
      options.x = _offset.x + (_offset.x - _offset.startX) * 3;
      options.x = (Math.round(options.x / _snap) * _snap);
      options.onUpdate = _rearrange;

      _tween = TweenLite.to(_offset, speed, options);
    };

    var _drag = function(event){
      var difference = {x: event.stageX - _oldPosition.x, y: event.stageY - _oldPosition.y};

      _offset.x += difference.x;
      _offset.y += difference.y;

      _oldPosition.x = event.stageX;
      _oldPosition.y = event.stageY;

      _rearrange();
    };

    var _rearrange = function(){
      var offset = _offset.x / _containerWidth * _degreeStep * 3;

      _sorting = [];

      for (_i = 0; _i < _count; _i++) {
        _element = self.elements[_i];

        _degree = _degreeStep * _i + offset;

        _element.x = Math.sin(_degree) * _containerWidth + _containerWidth / 2;
        _element.y = _containerHeight / 2;
        _element.z = 0 - Math.cos(_degree) * _containerWidth + _containerWidth;
        _sorting.push(_element);
      }

      _sorting = sortByKey(_sorting, 'z');
      _sorting.reverse();

      for (_i = 0; _i < _count; _i++) {
        _element = _sorting[_i];

        _element.alpha = 1 / (_count - _i) + .5;

        if (_i > Math.floor(_count * HIDE_PERCENTAGE)) _element.visible = true;
        else _element.visible = false;

        self.container.setChildIndex(_sorting[_i], _i);
      }
    }


    // initialize instance
    Init();
  };

  // export public Carousel definition
  Carousel.prototype = Public;

  // extend Carousel with defined parent
  if (Parent) sys.inherits(Carousel, Parent);

  // return Carousel definition to public scope
  return Carousel;
})();
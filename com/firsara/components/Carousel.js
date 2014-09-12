/*
TODO: create public "replace" method to replace an element at index X
This way a preloader is possible
NOTE: maybe even expose a preload function (with defined element box sizes)
TODO: create add function to add elements to carousel
TODO: don't use stage!!!!!
NOTE: create moveclip underneath, paint onto moveclip to make use of mouse-events

TODO: create module base class and template base class
TODO: create component base class and inherit from it!
 */

setPackage('com.firsara.components');

com.firsara.components.Carousel = (function(){
  var Parent = com.firsara.display.Container3d;

  var Public = {};

  // TODO: make as variables, not constants
  var BLUR = false;
  var BLUR_INTENSITY = 15;
  var SHADOW_INTENSITY = 12;
  var BLUR_QUALITY = 1;
  var SHADOW_QUALITY = 3;
  var RADIAN_MULTIPLY = Math.PI / 180;
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

    // NOTE: debug. set stage via initializer paramter, template or anything similar
    // NOTE: create invisible CACHED background that uses events rather than stage
    // NOTE: create public API setWidth; setHeight and resize() to define size
    var _stage = Main.stage;

    self.elements = [];

    var _offset = {x: 0, y: 0};
    var _oldPosition = {};
    var _moveFriction = 1;
    var _degreeStep = 0;

    var _i = 0;
    var _count = 0;
    var _sorting = null;
    var _element = null;
    var _degree = null;

    // constructor
    var Init = function(){
      // call super constructor
      if (Parent) Parent.call(self);

      self.x = Main.stage.canvas.width / 2;
      self.y = Main.stage.canvas.height / 2;
    };

    self.render = function(){
      // NOTE: dispose!!!!
      _stage.addEventListener('stagemousedown', _startDrag);

      _count = self.elements.length;
      _degreeStep = (Math.PI * 2) / _count;

      for (var i = 0; i < _count; i++) {
        var element = self.elements[i];
        element.width = 267;
        element.height = 200;
        element.y = element.height * -.5;
        if (BLUR) {
          element.cache(0, 0, element.width, element.height);
        }

        self.addChild(self.elements[i]);
      }

      _rearrange();
    };

    var _startDrag = function(event){
      _oldPosition.x = event.stageX;
      _oldPosition.y = event.stageY;

      _stage.addEventListener('stagemouseup', _stopDrag);
      _stage.addEventListener('stagemousemove', _drag);
    };

    var _stopDrag = function(event){
      _stage.removeEventListener('stagemouseup', _stopDrag);
      _stage.removeEventListener('stagemousemove', _drag);
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
      // NOTE: remove 1000 and use canvas width instead
      var offset = _offset.x / (1000 * _moveFriction);

      _sorting = [];

      for (_i = 0; _i < _count; _i++) {
        _element = self.elements[_i];

        _degree = _degreeStep * _i + offset;

        _element.x = Math.sin(_degree) * _stage.canvas.width - _element.width * .5;
        _element.z = 0 - Math.cos(_degree) * _stage.canvas.width + _stage.canvas.width;
        _sorting.push(_element);
      }

      _sorting = sortByKey(_sorting, 'z');
      _sorting.reverse();

      for (_i = 0; _i < _count; _i++) {
        _element = _sorting[_i];

        _element.alpha = 1 / (_count - _i) + .5;

        if (_i > Math.floor(_count*HIDE_PERCENTAGE)) _element.visible = true;
        else _element.visible = false;

        if (BLUR) {
          _element.filters = [new createjs.BlurFilter((_count - 1 - _i) * BLUR_INTENSITY, (_count - 1 - _i) * BLUR_INTENSITY, BLUR_QUALITY)];
          //element.filters = [new BlurFilter((_count - 1 - _i) * BLUR_INTENSITY, (_count - 1 - _i) * BLUR_INTENSITY, BLUR_QUALITY), new DropShadowFilter(0, 0, 0, 1, (_count - _i) * SHADOW_INTENSITY, (_count - _i) * SHADOW_INTENSITY, .6, SHADOW_QUALITY)];
          _element.updateCache();
        }

        self.setChildIndex(_sorting[_i], _i);
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
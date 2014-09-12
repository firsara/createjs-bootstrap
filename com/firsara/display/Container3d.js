setPackage('com.firsara.display');

// TODO: inherit draw from createjs.Container, remove update-function (maybe call super.draw via Parent.draw(self))

com.firsara.display.Container3d = (function(){
  var Parent = createjs.Container;

  var Public = {};

  var Container3d = function(){
    // instance
    var self = this;
    self.fov = 250;

    // constructor
    var Init = function(){
      // call super constructor
      if (Parent) Parent.call(self);
      self.addEventListener('tick', update);
    };

    var update = function(){
      // NOTE: build scaleX and scaleY and scaleZ(?)
      // NOTE: build rotation and rotationX, rotationY, rotationZ
      // NOTE: build skew(?)
      for (var i = 0, _len = self.getNumChildren(); i < _len; i++) {
        var el = self.getChildAt(i);

        // update props first
        if (el.x != el._calculatedX) el._storeX = el.x;
        if (el.y != el._calculatedY) el._storeY = el.y;
        if (el.z != el._calculatedZ) el._storeZ = el.z;

        var scale = self.fov / (self.fov + el._storeZ);
        el._calculatedZ = scale;
        el._calculatedX = el._storeX * scale;
        el._calculatedY = el._storeY * scale;

        // NOTE: check x- and y positioning
        // NOTE: check user-set scaleX / scaleY
        el.scaleX = el.scaleY = el._calculatedZ;
        el.x = el._calculatedX;
        el.y = el._calculatedY;
      }
    };

    // initialize instance
    Init();
  };

  // export public Container3d definition
  Container3d.prototype = Public;

  // extend Container3d with defined parent
  if (Parent) sys.inherits(Container3d, Parent);

  // return Container3d definition to public scope
  return Container3d;
})();
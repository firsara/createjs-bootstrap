setPackage('com.firsara.display');

com.firsara.display.TransformClip = (function(){
  var Parent = com.firsara.display.Transformable;

  var TransformClip = function(){
    // instance
    var self = this;
    // constructor
    var Init = function(){
      // call super constructor
      if (Parent) Parent.call(self);
      if (com.firsara.display.MoveClip) com.firsara.display.MoveClip.call(self);
      if (com.firsara.display.RotateClip) com.firsara.display.RotateClip.call(self);
      if (com.firsara.display.ScaleClip) com.firsara.display.ScaleClip.call(self);
    };

    // initialize instance
    Init();
  };

  // export public TransformClip definition
  TransformClip.prototype = {};

  // extend TransformClip with defined parent
  if (Parent) sys.inherits(TransformClip, Parent);

  // return TransformClip definition to public scope
  return TransformClip;
})();
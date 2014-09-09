/*
 * Base Stage controller class
 * Handles stage drawing
 * extend Main with Stage
 */

setPackage('com.firsara.display');

com.firsara.display.Stage = (function(){
  var Parent = null;

  // Public Functions
  var Public = {
    config: {
      fps: 50,
      mouseover: true,
      mouseoverTreshold: 10,
      touch: true,
      canvas: 'canvas'
    },

    stage: null
  };

  var Stage = function(){
    // instance
    var self = this;

    // Constructor
    var Init = function(){
      self.stage = new createjs.Stage(self.config.canvas);

      if (self.config.touch) createjs.Touch.enable(self.stage);
      if (self.config.mouseover) self.stage.enableMouseOver(self.config.mouseoverTreshold);
      //self.stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

      createjs.Ticker.setFPS(self.config.fps);
      createjs.Ticker.addEventListener('tick', update);

      window.addEventListener('resize', resize, false);
      resize();
    };

    // private functions
    var resize = function(){
      self.stage.canvas.width = window.innerWidth;
      self.stage.canvas.height = window.innerHeight;
    };

    var update = function(e){
      self.stage.update(e);
    };

    if (Parent) Parent.call(this);
    Init();
  };

  Stage.prototype = Public;
  if (Parent) sys.inherits(Stage, Parent);

  return Stage;
})();
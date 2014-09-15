/*
 * Base Stage controller class
 * Handles stage drawing
 * extend Main with Stage
 */

setPackage('com.firsara.display');

com.firsara.display.Stage = (function(){
  var Parent = createjs.Stage;

  // Public Functions
  var Public = {
    config: {
      fps: 60,
      mouseover: true,
      mouseoverTreshold: 10,
      touch: true,
      timingMode: createjs.Ticker.RAF_SYNCHED
    },

    stage: null
  };

  var Stage = function(canvas){
    // instance
    var self = this;

    // Constructor
    var Init = function(){
      if (Parent) Parent.call(self, canvas);

      if (self.config.touch) createjs.Touch.enable(self);
      if (self.config.mouseover) self.enableMouseOver(self.config.mouseoverTreshold);
      //self.stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

      createjs.Ticker.timingMode = self.config.timingMode;
      createjs.Ticker.setFPS(self.config.fps);
      createjs.Ticker.addEventListener('tick', update);

      window.addEventListener('resize', resize, false);
      resize();
    };

    // private functions
    var resize = function(){
      self.canvas.width = window.innerWidth;
      self.canvas.height = window.innerHeight;
    };

    var update = function(e){
      self.update(e);
    };

    Init();
  };

  Stage.prototype = Public;
  if (Parent) sys.inherits(Stage, Parent);

  return Stage;
})();
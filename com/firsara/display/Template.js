/*
 * Template container child class
 * stores controller and stage
 * template = new com.firsara.display.Template(self);
 * template.controller
 * template.stage
 */

setPackage('com.firsara.display');

com.firsara.display.Template = (function(){
  var Parent = createjs.Container;

  var Template = function(controller){
    // reference to instance
    var self = this;
    self.controller = null;
    self.stage = null;

    // constructor
    var Init = function(){
      self.controller = controller;
      self.stage = self.controller.stage;
    };

    // call super constructor
    if (Parent) Parent.call(this);
    // initialize instance
    Init();
  };

  // export public Template definition
  Template.prototype = {};

  // extend Template with defined parent
  if (Parent) sys.inherits(Template, Parent);

  // return Template definition to public scope
  return Template;
})();
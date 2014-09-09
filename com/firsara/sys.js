// ES5 15.2.3.5
// http://es5.github.com/#x15.2.3.5
if (!Object.create) {
  Object.create = function create(prototype, properties) {
    var object;
    if (prototype === null) {
      object = { "__proto__": null };
      } else {
        if (typeof prototype != "object") {
          throw new TypeError("typeof prototype["+(typeof prototype)+"] != 'object'");
        }

        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        // IE has no built-in implementation of `Object.getPrototypeOf`
        // neither `__proto__`, but this manually setting `__proto__` will
        // guarantee that `Object.getPrototypeOf` will work as expected with
        // objects created using `Object.create`
        object.__proto__ = prototype;
      }
      if (properties !== void 0) {
        Object.defineProperties(object, properties);
      }

    return object;
  };
}


// Sys Implementation
// See Node.js http://www.nodejs.org/
var sys = (function(){
  var exports = {};

  exports.inherits = function(ctor, superCtor) {
    var store = ctor.prototype;

    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    for (var k in store) {
      ctor.prototype[k] = store[k];
    }
  };

  return exports;
})();



var global = this;

var setPackage = function(pkg){
  var elements = pkg.split('.');
  var scope = global;

  for (var i = 0; i < elements.length; i++) {
    if (! scope[elements[i]]) scope[elements[i]] = {};
    scope = scope[elements[i]];
  }

  return scope;
};

var newClass = function(className, definition){
  var scope = newPackage(pkg);
  scope = definition;
};


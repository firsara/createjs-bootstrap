/*
 * Assets extends LoadQueue
 * Stores preloaded Images
 * usage:
 * var assets = new com.firsara.data.Assets();
 * assets.load([{id: "image", src: "image/source.jpg"}]);
 * var bitmap = new createjs.Bitmap( com.firsara.data.Assets.get('image') );
 */

setPackage('com.firsara.data');

com.firsara.data.Assets = (function(){
  var Parent = createjs.LoadQueue;

  var Public = {};

  var Assets = function(){
    // instance
    var self = this;

    // assets get stored here
    var _assets = {};

    var _preloadData = [];
    var _preloadImages = [];
    var _partiallyImages = 0.05;
    var _loadedFiles = 0;

    Assets.get = function(name){
      if (_assets[name]) return _assets[name];
    };

    var Init = function(){
      if (Parent) Parent.call(self);

      if (Assets.instance) throw new Error('assets can only be initialized once');
    };

    self.load = function(data){
      _preloadData = data;

      self.addEventListener('fileload', progress);
      self.addEventListener('complete', complete);
      self.loadManifest(data);
    };

    self.get = function(name){
      return Assets.get(name);
    };

    var dispatchReady = function(){
      self.dispatchEvent('ready');
    };

    var progress = function(event){
      _loadedFiles++;

      _assets[event.item.id] = event.rawResult;

      if (event.item.type == createjs.LoadQueue.IMAGE) {
        _preloadImages.push({name: event.item.id, src: event.result.src});
      }

      var event = new createjs.Event('update');
      event.percent = (_loadedFiles / _preloadData.length) * (1 - _partiallyImages);
      self.dispatchEvent(event);
    };

    var complete = function(){
      var _loadedFiles = -1;
      var preloadAssetsLength = _preloadImages.length;

      var loadNextImage = function(){
        _loadedFiles++;

        var event = new createjs.Event('update');
        event.percent = (1 - _partiallyImages) + (_loadedFiles / preloadAssetsLength) * _partiallyImages;
        self.dispatchEvent(event);

        if (_preloadImages.length <= 0) {
          dispatchReady();
        } else {
          var element = _preloadImages.shift();
          _assets[element.name] = new Image();
          _assets[element.name].addEventListener('load', loadNextImage);
          _assets[element.name].src = element.src;
        }
      };

      loadNextImage();
    };


    Init();
  };

  Assets.prototype = Public;

  if (Parent) sys.inherits(Assets, Parent);

  return Assets;
})();
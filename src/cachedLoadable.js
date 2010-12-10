
  // EXPERIMENTAL EXPERIMENTAL EXPERIMENTAL EXPERIMENTAL EXPERIMENTAL
  // MENTAL EXPERIMENTAL EXPERIMENTAL EXPERIMENTAL EXPERIMENTAL EXPERI
  // EXPERIMENTAL EXPERIMENTAL EXPERIMENTAL EXPERIMENTAL EXPERIMENTAL
  // MENTAL EXPERIMENTAL EXPERIMENTAL EXPERIMENTAL EXPERIMENTAL EXPERI
  
  jQuery.cachedLoadable = function (obj, defaultCfg) {

    obj = jQuery.cacheable(obj, defaultCfg.ttl);

    delete defaultCfg.ttl;
  
    jQuery.loadable(obj, defaultCfg);

    var _load = obj.load;

    obj.load = function (cfg) {

      var url    = cfg.url || defaultCfg.url,
          query  = jQuery.param(cfg.data || defaultCfg.data),
          key    = url + '?' + query,
          cached = this.cacheGet(key);

      if (cached) {

        cfg.success && cfg.success.apply(this, cached);
        this.trigger('onLoadSuccess', cached);

      } else {

        _load.call(this, jQuery.extend({}, cfg, {
          success: function (data) {
            this.cacheSet(key, arguments);
            cfg.success && cfg.success.apply(this, arguments);
          }
        }));

      }
    };

    return obj;
  };



  /*
  
  // Usage
  
  function MyThing () {}
  
  // Implenent behavior:
  $.cachedLoadable(MyThing, {

    // new property!
    ttl: 5000,

    url: 'test.json',
    dataFilter: function (data) {
      var items = $.parseJSON(data).items.sort();
      items.push(+new Date());
      return items;
    }
  });
  

  // Create instance
  var m = new MyThing();

  // Listen to laod
  m.onLoadSuccess(function (evt, data) {
    console.log('listener heard:', data);
  });
  
  // Call load every second
  // Will only hit server once every 5 seconds
  // Will load from cache the rest of the time
  setInterval(function () {
    m.load({data:{foo:'bar'}});
  }, 1000);

  */
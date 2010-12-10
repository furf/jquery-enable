
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

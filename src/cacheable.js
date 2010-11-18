
  /**
   * $.cacheable
   *
   * @param {object|function} obj (optional) Object to be augmented with cacheable behavior
   * @param {number} defaultTtl (optional) Default time-to-live for cached items
   * @return {object} Augmented object
   */
  $.cacheable = function (obj, defaultTtl) {

    // Allow instantiation without object
    if (!(obj instanceof Object)) {
      defaultTtl = obj;
      obj        = {};
    }

    // Allow use of prototype for shorthanding the augmentation of classes
    obj = obj.prototype || obj;

    // I love using Infinity :)
    defaultTtl = typeof defaultTtl !== 'undefined' ? defaultTtl : Infinity;

    $.extend(obj, {

      /**
       * @param {string} key
       * @param {*} value
       * @param {number} ttl
       * @return undefined
       */
      cacheSet: function(key, value, ttl) {

        var self    = $(this),
            cache   = self.data('cacheable.cache') || {},
            expires = $.now() + (typeof ttl !== 'undefined' ? ttl : defaultTtl);

        cache[key] = {
          value:   value,
          expires: expires
        };

        self.data('cacheable.cache', cache);
      },

      /**
       * @param {string} key
       * @return
       */
      cacheGet: function(key) {

        var cache = $(this).data('cacheable.cache') || {},
            data,
            ret;

        if (key) {

          if (key in cache) {

            data = cache[key];

            if (data.expires < $.now()) {
              this.cacheUnset(key);
            } else {
              ret = data.value;
            }
          }

        } else {
          ret = cache;
        }

        return ret;
      },

      /**
       * @param {string} key
       * @return {boolean}
       */
      cacheHas: function(key) {
        var cache = $(this).data('cacheable.cache');
        return (key in cache);
      },

      /**
       * @param {string} key
       * @return undefined
       */
      cacheUnset: function(key) {

        var self  = $(this),
            cache = self.data('cacheable.cache');

        if (cache && key in cache) {

          cache[key] = null;
          delete cache[key];

          self.data('cacheable.cache', cache);
        }
      },

      cacheEmpty: function() {
        $(this).data('cacheable.cache', {});
      }

    });

    return obj;
  };

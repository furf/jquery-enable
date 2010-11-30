
  /**
   * @description <p>Augments a static object or Class prototype with timed
   * caching functionality.</p>
   *
   * @param {Object|Function} obj (optional) Object to be augmented with
   *   cacheable behavior
   * @param {Number} defaultTtl (optional) Default time-to-live for cached
   *   items
   * @return {object} Augmented object
   */
  jQuery.cacheable = function (obj, defaultTtl) {

    // Allow instantiation without object
    if (!(obj instanceof Object)) {
      defaultTtl = obj;
      obj        = {};
    }

    // Allow use of prototype for shorthanding the augmentation of classes
    obj = obj.prototype || obj;

    // I love using Infinity :)
    defaultTtl = typeof defaultTtl !== 'undefined' ? defaultTtl : Infinity;

    jQuery.extend(obj, {

      /**
       * @param {String} key
       * @param {*} value
       * @param {Number} ttl
       * @return undefined
       */
      cacheSet: function(key, value, ttl) {

        var self    = jQuery(this),
            cache   = self.data('cacheable.cache') || {},
            expires = jQuery.now() + (typeof ttl !== 'undefined' ? ttl : defaultTtl);

        cache[key] = {
          value:   value,
          expires: expires
        };

        self.data('cacheable.cache', cache);
      },

      /**
       * @param {String} key
       * @return
       */
      cacheGet: function(key) {

        var cache = jQuery(this).data('cacheable.cache') || {},
            data,
            ret;

        if (key) {

          if (key in cache) {

            data = cache[key];

            if (data.expires < jQuery.now()) {
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
       * @param {String} key
       * @return {boolean}
       */
      cacheHas: function(key) {
        var cache = jQuery(this).data('cacheable.cache');
        return (key in cache);
      },

      /**
       * @param {String} key
       * @return undefined
       */
      cacheUnset: function(key) {

        var self  = jQuery(this),
            cache = self.data('cacheable.cache');

        if (cache && key in cache) {

          cache[key] = null;
          delete cache[key];

          self.data('cacheable.cache', cache);
        }
      },

      cacheEmpty: function() {
        jQuery(this).data('cacheable.cache', {});
      }

    });

    return obj;
  };

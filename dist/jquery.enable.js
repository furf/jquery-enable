(function (window, document, $) {

  /**
   * Regular expression for finding whitespace
   * @type {regexp}
   */
  var rwhite = /\s+/;

  /**
   * @param {string} str Whitespace-delimited list
   * @return {array}
   */
  $.unwhite = function (str) {
    str = str && $.trim(str);
    return str.length ? str.split(rwhite) : [];
  };

  /**
   * Add jQuery custom events to any object
   * @param {object|function} obj (optional) Object to be augmented with bindable behavior
   * @param {string} types (optional) Custom event subscriber functions
   * @return {object} Augmented object
   */
  $.bindable = function (obj, types) {

    // Allow instantiation without object
    if (!(obj instanceof Object)) {
      types = obj;
      obj   = {};
    }

    // Allow use of prototype for shorthanding the augmentation of classes
    obj = $.isFunction(obj) ? obj.prototype : obj;

    // Augment the object with jQuery's bind, one, and unbind event methods
    $.each(['bind', 'one', 'unbind'], function (i, method) {
      obj[method] = function (type, data, fn) {
        $(this)[method](type, data, fn);
        return this;
      };
    });

    // The trigger event must be augmented separately because it requires a new
    // Event to prevent unexpected triggering of a method (and possibly
    // infinite recursion) when the event type matches the method name
    obj.trigger = function (type, data) {

      var event = new $.Event(type),
          all   = new $.Event(event);

      event.preventDefault();
      
      all.type = '*';

      if (event.type !== all.type) {
        $.event.trigger(event, data, this);
      }
      
      $.event.trigger(all, data, this);
      
      return this;
    };

    // Create convenience methods for event subscription which bind callbacks
    // to specified events
    if (typeof types === 'string') {
      $.each($.unwhite(types), function (i, type) {
        obj[type] = function (data, fn) {
          return arguments.length ? this.bind(type, data, fn) : this.trigger(type);
        };
      });
    }

    return obj;
  };

  /**
   * $.loadable
   *
   * @param {object|function} obj (optional) Object to be augmented with loadable behavior
   * @param {object|string} defaultCfg Default $.ajax configuration object
   * @return {object} Augmented object
   */
  $.loadable = function (obj, defaultCfg) {

    // Allow instantiation without object
    if (typeof defaultCfg === 'undefined') {
      defaultCfg = obj;
      obj = {};
    }

    // Implement bindable behavior, adding custom methods for Ajax events
    obj = $.bindable(obj, 'onLoadBeforeSend onLoadAbort onLoadSuccess onLoadError onLoadComplete');

    // Allow URL as config (shortcut)
    if (typeof defaultCfg === 'string') {
      defaultCfg = {
        url: defaultCfg
      };
    }

    $.extend(obj, {

      /**
       * Merge runtime config with default config
       * Refactored out of load() for easier integration with everyone's
       * favorite sequential AJAX library...
       */
      loadableConfig: function (cfg) {

        var beforeSend, dataFilter, success, error, complete;

        // If one parameter is passed, it's either a config or a callback
        // @todo take (url, callback)
        if (typeof cfg === 'string') {
          cfg = {
            url: cfg
          };
        } else if ($.isFunction(cfg)) {
          cfg = {
            success: cfg
          };
        }

        // Extend default config with runtime config
        cfg = $.extend(true, {}, defaultCfg, cfg);

        // Cache configured callbacks so they can be called from wrapper
        // functions below.
        beforeSend = cfg.beforeSend;
        dataFilter = cfg.dataFilter;
        success    = cfg.success;
        error      = cfg.error;
        complete   = cfg.complete;

        // Overload each of the configured $.ajax callback methods with an
        // evented wrapper function. Each wrapper function executes the
        // configured callback in the scope of the loadable object and then
        // fires the corresponding event, passing to it the return value of
        // the configured callback or the unmodified arguments if no callback
        // is supplied or the return value is undefined.
        return $.extend(cfg, {

          /**
           * @param {XMLHTTPRequest} xhr
           * @param {object} cfg
           */
          beforeSend: $.proxy(function (xhr, cfg) {

            // If defined, execute the beforeSend callback and store its return
            // value for later return from this proxy function -- used for
            // aborting the XHR
            var ret = beforeSend && beforeSend.apply(this, arguments);

            // Trigger the onLoadBeforeSend event listeners
            this.trigger('onLoadBeforeSend', arguments);

            // If the request is explicitly aborted from the beforeSend
            // callback, trigger the onLoadAbort event listeners
            if (ret === false) {
              this.trigger('onLoadAbort', arguments);
            }

            return ret;

          }, this),


          // just added -- doc it up
          dataFilter: dataFilter && $.proxy(function (response, type) {
            return dataFilter.apply(this, arguments);
          }, this),


          /**
           * @param {object} data
           * @param {string} status
           * @param {XMLHTTPRequest} xhr
           */
          success: $.proxy(function (data, status, xhr) {

            var ret;

            // If defined, execute the success callback
            if (success) {
              ret = success.apply(this, arguments);
            }

            // Trigger the onLoadSuccess event listeners
            this.trigger('onLoadSuccess',  arguments);

            return ret;

          }, this),

          /**
           * @param {XMLHTTPRequest} xhr
           * @param {string} status
           * @param {Error} e
           * @todo correct param type for error?
           */
          error: $.proxy(function (xhr, status, e) {

            var ret;

            // If defined, execute the error callback
            if (error) {
              ret = error.apply(this, arguments);
            }

            // Trigger the onLoadError event listeners
            this.trigger('onLoadError', arguments);

            return ret;

          }, this),

          /**
           * @param {XMLHTTPRequest} xhr
           * @param {string} status
           */
          complete: $.proxy(function (xhr, status) {

            var ret;

            // If defined, execute the complete callback
            if (complete) {
              ret = complete.apply(this, arguments);
            }

            // Trigger the onLoadComplete event listeners
            this.trigger('onLoadComplete', arguments);

            return ret;

          }, this)
        });
      },

      /**
       * Execute the XMLHTTPRequest
       * @param {object} cfg Overload $.ajax configuration object
       */
      load: function (cfg) {
        return $.ajax(this.loadableConfig(cfg));
      }

    });

    return obj;
  };

  /**
   * $.renderable
   *
   * @param {object|function} obj (optional) Object to be augmented with renderable behavior
   * @param {string} tpl Template or URL to template file
   * @param {string|jQuery} elem (optional) Target DOM element
   * @return {object} Augmented object
   */
  $.renderable = function (obj, tpl, elem) {

    // Allow instantiation without object
    if (!(obj instanceof Object)) {
      elem = tpl;
      tpl  = obj;
      obj  = {};
    }

    // Implement bindable behavior, adding custom methods for render events
    obj = $.bindable(obj, 'onBeforeRender onRender');

    // Create a jQuery target to handle DOM load
    if (typeof elem !== 'undefined') {
      elem = $(elem);
    }

    // Create renderer function from supplied template
    var renderer = $.isFunction(tpl) ? tpl : $.template(tpl);

    // Augment the object with a render method
    obj.render = function (data, raw) {

      if (!(data instanceof Object)) {
        raw  = data;
        data = this;
      } else {
        data = $.extend(true, {}, this, data);
      }

      this.trigger('onBeforeRender', [data]);

      // Force raw HTML if elem exists (saves effort)
      var ret = renderer.call(this, data, !!elem || raw);

      if (elem) {
        elem.html(ret);
      }

      this.trigger('onRender', [ret]);

      return ret;
    };

    return obj;
  };

  /**
   * $.pollable
   * @todo add passing of anon function to start?
   * @param {object|function} obj (optional) Object to be augmented with pollable behavior
   * @return {object} Augmented object
   */
  $.pollable = function (obj) {

    // Allow instantiation without object
    if (typeof obj === 'undefined') {
      obj = {};
    }

    // Implement bindable behavior, adding custom methods for pollable events
    obj = $.bindable(obj, 'onStart onExecute onStop');

    // Augment the object with an pollable methods
    $.extend(obj, {

      /**
       * @param {string} method
       * @return {boolean}
       */
      isExecuting: function (method) {
        var timers = $(this).data('pollable.timers') || {};
        return method in timers;
      },

      /**
       * @param {string} method
       * @param {number} interval
       * @param {boolean} immediately
       */
      start: function (method, interval, data, immediately) {

        var self, timers;

        if (typeof data === 'boolean') {
          immediately = data;
          data = null;
        }

        data = data || [];

        if (!this.isExecuting(method) && $.isFunction(this[method]) && interval > 0) {

          self   = $(this);
          timers = self.data('pollable.timers') || {};

          // Store the proxy method as a property of the original method
          // for later removal
          this[method].proxy = $.proxy(function () {
            this.trigger('onExecute', [method, this[method].apply(this, data)]);
          }, this);

          // Start timer and add to hash
          timers[method] = window.setInterval(this[method].proxy, interval);

          self.data('pollable.timers', timers);

          // Fire onStart event with method name
          this.trigger('onStart', [method]);

          if (immediately) {
            this[method].proxy();
          }
        }

        return this;
      },

      /**
       * @param {string} method
       */
      stop: function (method) {

        var self, timers;

        if (this.isExecuting(method)) {

          self   = $(this);
          timers = self.data('pollable.timers') || {};

          // Clear timer
          window.clearInterval(timers[method]);

          // Remove timer from hash
          delete timers[method];

          // Remove proxy method from original method
          delete this[method].proxy;

          self.data('pollable.timers', timers);

          // Fire onStop event with method name
          this.trigger('onStop', [method]);
        }
        return this;
      }
    });

    return obj;
  };

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

  /**
   * $.observable
   *
   * @param {object|function} obj Object to be augmented with observable behavior
   * @return {object} Augmented object
   */
  $.observable = function (obj) {

    // Allow instantiation without object
    if (typeof obj === 'undefined') {
      obj = {};
    }

    // Implement bindable behavior, adding custom methods for render events
    obj = $.bindable(obj, 'onObserve');

    // Augment the object with observe and ignore methods
    $.extend(obj, {

      observe: function (obj, namespaces) {
        obj.bind('*', $.proxy(function (evt) {

          var orig = evt.originalEvent,
              type = orig.type,
              args = Array.prototype.slice.call(arguments, 1);

          if (namespace) {
            var self = this;
            $.each($.unwhite(namespace), function (i, ns) {
              orig.type = type + '/' + ns;
              self.trigger(orig, args);
            });
          }

          orig.type = type + '/*';
          this.trigger(orig, args);

        }, this));
        this.trigger('onObserve', [namespace]);
        return this;
      },

      ignore: function (obj) {
        // @todo
        this.trigger('onIgnore', [namespace]);
      }
    });

    return obj;
  };

})(this, this.document, this.jQuery);


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

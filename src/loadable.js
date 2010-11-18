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

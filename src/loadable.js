
  /**
   * @description <p>Augments a static object or Class prototype with
   * evented Ajax functionality.</p>
   * 
   * @param {Object|Function} obj (optional) Object to be augmented with
   *   loadable behavior
   * @param {Object|String} defaultCfg Default Ajax settings
   * @return {Object} Augmented object
   */
  jQuery.loadable = function (obj, defaultCfg) {

    // Allow instantiation without object
    if (typeof defaultCfg === 'undefined') {
      defaultCfg = obj;
      obj = {};
    }

    // Implement bindable behavior, adding custom methods for Ajax events
    obj = jQuery.bindable(obj, 'onLoadBeforeSend onLoadAbort onLoadSuccess onLoadError onLoadComplete');

    // Allow URL as config (shortcut)
    if (typeof defaultCfg === 'string') {
      defaultCfg = {
        url: defaultCfg
      };
    }

    jQuery.extend(obj, {

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
        } else if (jQuery.isFunction(cfg)) {
          cfg = {
            success: cfg
          };
        }

        // Extend default config with runtime config
        cfg = jQuery.extend(true, {}, defaultCfg, cfg);

        // Cache configured callbacks so they can be called from wrapper
        // functions below.
        beforeSend = cfg.beforeSend;
        dataFilter = cfg.dataFilter;
        success    = cfg.success;
        error      = cfg.error;
        complete   = cfg.complete;

        // Overload each of the configured jQuery.ajax callback methods with
        // an evented wrapper function. Each wrapper function executes the
        // configured callback in the scope of the loadable object and then
        // fires the corresponding event, passing to it the return value of
        // the configured callback or the unmodified arguments if no callback
        // is supplied or the return value is undefined.
        return jQuery.extend(cfg, {

          /**
           * @param {XMLHTTPRequest} xhr
           * @param {Object} cfg
           */
          beforeSend: jQuery.proxy(function (xhr, cfg) {

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
          dataFilter: dataFilter && jQuery.proxy(function (response, type) {
            return dataFilter.apply(this, arguments);
          }, this),


          /**
           * @param {Object} data
           * @param {String} status
           * @param {XMLHTTPRequest} xhr
           */
          success: jQuery.proxy(function (data, status, xhr) {

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
           * @param {String} status
           * @param {Error} e
           * @todo correct param type for error?
           */
          error: jQuery.proxy(function (xhr, status, e) {

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
           * @param {String} status
           */
          complete: jQuery.proxy(function (xhr, status) {

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
       * @param {Object} cfg Overload jQuery.ajax configuration object
       */
      load: function (cfg) {
        return jQuery.ajax(this.loadableConfig(cfg));
      }

    });

    return obj;
  };

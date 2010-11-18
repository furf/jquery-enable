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

  /**
   * jQuery.observable
   *
   * @param {object|function} obj Object to be augmented with observable behavior
   * @return {object} Augmented object
   */
  jQuery.observable = function (obj) {

    // Allow instantiation without object
    if (typeof obj === 'undefined') {
      obj = {};
    }

    // Implement bindable behavior, adding custom methods for render events
    obj = jQuery.bindable(obj, 'onObserve');

    // Augment the object with observe and ignore methods
    jQuery.extend(obj, {

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

  jQuery.bindable = function (obj, types) {

    // Allow instantiation without object
    if (!(obj instanceof Object)) {
      types = obj;
      obj   = {};
    }

    // Allow use of prototype for shorthanding the augmentation of classes
    obj = jQuery.isFunction(obj) ? obj.prototype : obj;

    // Augment the object with jQuery's bind, one, and unbind event methods
    jQuery(['bind', 'one', 'unbind']).each(function (i, method) {
      obj[method] = function (type, data, fn, thisObject) {
        jQuery(this)[method](type, data, fn, thisObject);
        return this;
      };
    });

    // The trigger event must be augmented separately because it requires a new
    // Event to prevent unexpected triggering of a method (and possibly
    // infinite recursion) when the event type matches the method name
    obj.trigger = function (type, data) {
      var event = new jQuery.Event(type),
          all   = new jQuery.Event(event);
      event.preventDefault();
      all.type = '*';
      if (event.type !== '*') {
        jQuery(this).trigger(event, data);
      }
      jQuery(this).trigger(all, data);
      return this;
    };

    // Create convenience methods for event subscription which bind callbacks
    // to specified events
    if (typeof types === 'string') {
      jQuery.each(jQuery.unwhite(types), function (i, type) {
        obj[type] = function (data, fn, thisObject) {
          return arguments.length ? this.bind(type, data, fn, thisObject) : this.trigger(type);
        };
      });
    }

    return obj;
  };

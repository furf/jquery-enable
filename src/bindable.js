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

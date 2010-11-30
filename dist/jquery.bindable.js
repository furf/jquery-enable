/** 
 * jQuery.enable v0.6.0
 * 
 * @name jQuery
 * @namespace 
 *
 * @description <p>jQuery.enable.js is a small library of jQuery plugins
 *   designed to extend evented behaviors to JavaScript objects and classes.
 *   These behaviors include: custom events, Ajax, templating, caching,
 *   polling, and more.</p>
 *   <p>The cornerstone of the library is jQuery.bindable behavior. All of the
 *   other behaviors "inherit" custom event functionality from bindable.</p>
 *   
 * @author <a href="http://twitter.com/furf">Dave Furfero</a>
 */ 
(function (window, document, jQuery) {

  /**
   * Regular expression for finding whitespace
   * @type {regexp}
   */
  var rwhite = /\s+/;

  /**
   * @description <p>Trims and splits a whitespace-delimited string. A
   *   shortcut for splitting "jQuery-style" lists.</p>
   *
   * @example
   *
   * jQuery.unwhite('onDoSomething onDoSomethingElse');
   * // returns ['onDoSomething', 'onDoSomethingElse']
   *
   * @param {String} str Whitespace-delimited list
   * @return {Array} Array of list times
   */
  jQuery.unwhite = function (str) {
    str = str && jQuery.trim(str);
    return str.length ? str.split(rwhite) : [];
  };

  /**
   * @description <p>Takes a function and returns a new one that will always
   * have a particular context, omitting the event argument for improved
   * compatibility with external APIs.</p>
   * @see The documentation for
   *   <a href="http://api.jquery.com/jQuery.proxy/">jQuery.proxy</a>.
   *
   * @example
   *
   * // Bind a proxied function to an evented object
   * loadableObject.bind('onLoadSuccess', jQuery.eventProxy(function (data) {
   *   alert(data.message);
   * }));
   *
   * // Trigger the event
   * loadableObject.trigger('onLoadSuccess', [{ message: 'hello, world!' }]);
   *
   * // The event object normally passed as the first argument to callbacks
   * // is ignored and our callback alerts "hello, world!"
   *
   * @param {Function} fn
   * @param {Object} context (optional)
   */
  jQuery.eventProxy = function (fn, context) {
    var proxy = jQuery.proxy.apply(null, arguments);
    return function () {
      return proxy.apply(null, Array.prototype.slice.call(arguments, 1));
    };
  };

  /**
   * @description <p>Augments a static object or Class prototype with
   * custom event functionality.</p>
   * 
   * @example
   * // Usage with a static object
   * var dave = {
   *   name: 'dave',
   *   saySomething: function (text) {
   *     alert(this.name + ' says: ' + text);
   *     this.trigger('onSaySomething', [text]);
   *   }
   * };
   * 
   * // Add bindable behavior
   * $.bindable(dave);
   * 
   * // Add event listener using bind method
   * dave.bind('onSaySomething', function (evt, data) {
   *   console.log(this.name + ' said: ' + data);
   * });
   * 
   * dave.saySomething('hello, world!');
   * // alerts "furf says: hello, world!"
   * // logs "furf said: hello, world!"
   * 
   * @example
   * // Usage with a class
   * function Person (name) {
   *   this.name = name
   * }
   * 
   * // Add bindable behavior with custom event method
   * $.bindable(Person, 'onSaySomething');
   * 
   * Person.prototype.saySomething = function (text) {
   *   alert(this.name + ' says: ' + text);
   *   this.trigger('onSaySomething', [text]);
   * };
   * 
   * // Create instance
   * var furf = new Person('furf');
   * 
   * // Add event listener using custom event method
   * furf.onSaySomething(function (evt, data) {
   *   console.log(this.name + ' said: ' + data);
   * });
   * 
   * furf.saySomething('hello, world!');
   * // alerts "furf says: hello, world!"
   * // logs "furf said: hello, world!"
   * 
   * @param {Object|Function} obj (optional) Object to be augmented with
   *   bindable behavior. If none is supplied, a new Object will be created
   *   and augmented. If a function is supplied, its prototype will be 
   *   augmented, allowing each instance of the function access to the 
   *   bindable methods.
   * @param {String} types (optional) Whitespace-delimited list of custom
   *   events which will be exposed as convenience bind methods on the
   *   augmented object
   * @returns {Object} Augmented object
   */
  jQuery.bindable = function (obj, types) {

    // Allow instantiation without object
    if (!(obj instanceof Object)) {
      types = obj;
      obj   = {};
    }

    // Allow use of prototype for shorthanding the augmentation of classes
    obj = jQuery.isFunction(obj) ? obj.prototype : obj;

    // Augment the object with jQuery's bind, one, and unbind event methods
    jQuery.each(['bind', 'one', 'unbind'], function (i, method) {
      obj[method] = function (type, data, fn) {
        jQuery(this)[method](type, data, fn);
        return this;
      };
    });

    // The trigger event must be augmented separately because it requires a
    // new Event to prevent unexpected triggering of a method (and possibly
    // infinite recursion) when the event type matches the method name
    obj.trigger = function (type, data) {

      var event = new jQuery.Event(type),
          all   = new jQuery.Event(event);

      event.preventDefault();
      
      all.type = '*';

      if (event.type !== all.type) {
        jQuery.event.trigger(event, data, this);
      }
      
      jQuery.event.trigger(all, data, this);
      
      return this;
    };

    // Create convenience methods for event subscription which bind callbacks
    // to specified events
    if (typeof types === 'string') {
      jQuery.each(jQuery.unwhite(types), function (i, type) {
        obj[type] = function (data, fn) {
          return arguments.length ? this.bind(type, data, fn) : this.trigger(type);
        };
      });
    }

    return obj;
  };

})(this, this.document, this.jQuery);

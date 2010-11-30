
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

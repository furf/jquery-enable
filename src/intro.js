(function (window, document, jQuery) {

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

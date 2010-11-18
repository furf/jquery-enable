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
  jQuery.unwhite = function (str) {
    str = str && jQuery.trim(str);
    return str.length ? str.split(rwhite) : [];
  };

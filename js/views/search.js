// Generated by CoffeeScript 1.3.3
var View_Search;

View_Search = (function() {

  function View_Search() {}

  View_Search.prototype.init = function() {
    this.id = 'Search';
    return this.name = 'Search';
  };

  View_Search.prototype.content = function() {
    var output;
    output = '<div style="height:10px;"></div>';
    output += '<form id="search">';
    output += '<input type="text" name="terms" id="terms" /> ';
    output += '<input type="submit" value="chercher" />';
    output += '</form>';
    output += '<div id="suggests_shows"></div>';
    output += '<div id="suggests_members"></div>';
    output += '<div id="results_shows"></div>';
    output += '<div id="results_members"></div>';
    setTimeout((function() {
      return $('#terms').focus();
    }), 100);
    return output;
  };

  return View_Search;

})();
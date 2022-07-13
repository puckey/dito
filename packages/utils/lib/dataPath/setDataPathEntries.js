"use strict";

exports.__esModule = true;
exports.setDataPathEntries = setDataPathEntries;

require("core-js/modules/es.object.entries.js");

var _setValueAtDataPath = require("./setValueAtDataPath");

function setDataPathEntries(obj, entries) {
  for (var _i = 0, _Object$entries = Object.entries(entries); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _Object$entries[_i],
        path = _Object$entries$_i[0],
        value = _Object$entries$_i[1];
    (0, _setValueAtDataPath.setValueAtDataPath)(obj, path, value);
  }

  return obj;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRhUGF0aC9zZXREYXRhUGF0aEVudHJpZXMuanMiXSwibmFtZXMiOlsic2V0RGF0YVBhdGhFbnRyaWVzIiwib2JqIiwiZW50cmllcyIsIk9iamVjdCIsInBhdGgiLCJ2YWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUVPLFNBQVNBLGtCQUFULENBQTRCQyxHQUE1QixFQUFpQ0MsT0FBakMsRUFBMEM7QUFDL0MscUNBQTRCQyxNQUFNLENBQUNELE9BQVAsQ0FBZUEsT0FBZixDQUE1QixxQ0FBcUQ7QUFBaEQ7QUFBQSxRQUFPRSxJQUFQO0FBQUEsUUFBYUMsS0FBYjtBQUNILGdEQUFtQkosR0FBbkIsRUFBd0JHLElBQXhCLEVBQThCQyxLQUE5QjtBQUNEOztBQUNELFNBQU9KLEdBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNldFZhbHVlQXREYXRhUGF0aCB9IGZyb20gJy4vc2V0VmFsdWVBdERhdGFQYXRoJ1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0RGF0YVBhdGhFbnRyaWVzKG9iaiwgZW50cmllcykge1xuICBmb3IgKGNvbnN0IFtwYXRoLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZW50cmllcykpIHtcbiAgICBzZXRWYWx1ZUF0RGF0YVBhdGgob2JqLCBwYXRoLCB2YWx1ZSlcbiAgfVxuICByZXR1cm4gb2JqXG59XG4iXX0=
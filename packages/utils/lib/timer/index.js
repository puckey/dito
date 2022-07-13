"use strict";

require("core-js/modules/web.dom-collections.for-each.js");

require("core-js/modules/es.object.keys.js");

exports.__esModule = true;

var _debounce = require("./debounce");

Object.keys(_debounce).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _debounce[key]) return;
  exports[key] = _debounce[key];
});

var _debounceAsync = require("./debounceAsync");

Object.keys(_debounceAsync).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _debounceAsync[key]) return;
  exports[key] = _debounceAsync[key];
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90aW1lci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQ0E7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCAqIGZyb20gJy4vZGVib3VuY2UnXG5leHBvcnQgKiBmcm9tICcuL2RlYm91bmNlQXN5bmMnXG4iXX0=